const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const next = require("next");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const crypto = require("crypto");  
dotenv.config({ path: ".env.local" });


function hashIp(ip) {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

async function emitGameUpdate(io, gameId) {
  try {
    const updatedGame = await Game.findById(gameId)
      .populate("players", "username")
      .populate("admin", "username")
      .populate("scores.player", "username")
      .populate("questions")
      .lean();
    if (updatedGame) {
      io.to(gameId).emit("gameUpdated", { game: updatedGame });
      console.log(`gameUpdated für ${gameId} gesendet.`);
    }
  } catch (error) {
    console.error("Fehler bei emitGameUpdate:", error);
  }
}

const Game = require("../db/models/Game").default;
const User = require("../db/models/User").default;
const Temporary = require("../db/models/Temporaryuser").default;
const Task = require("../db/models/Task").default;

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev, dir: "./" });
const handle = nextApp.getRequestHandler();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGO_URI, {
    dbName: process.env.DATABASE_NAME,
  })
  .then(() => {
    console.log("✅ MongoDB verbunden");
  })
  .catch((error) => console.log("❌ MongoDB Fehler:", error));

console.log("🚀 Server wird vorbereitet...");

nextApp
  .prepare()
  .then(() => {
    console.log("✅ Next.js ist bereit!");

    const server = express();
    const httpServer = http.createServer(server);
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      path: "/socket.io",
    });

    server.use(cors());

    const activePlayersPerGame = {};

    io.on("connection", (socket) => {
      socket.on("joinGame", async ({ gameId, playerId, username }) => {
        const rawIp =
          socket.handshake.headers["x-forwarded-for"]?.split(",")[0] || socket.handshake.address;

        const normalizeIp = (ip) => {
          if (ip === "::1") return "127.0.0.1"; 
          if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", ""); 
          return ip;
        };

        const clientIp = normalizeIp(rawIp);

        console.log("Spieler beitritt", { gameId, playerId, username, clientIp });

        const hashedIp = hashIp(clientIp);

        try {
          const game = await Game.findById(gameId);

          if (!game) {
            console.log("Game nicht gefunden!");
            return;
          }

          // Prüfen, ob die gehashte IP in der Blockierungsliste des Spiels enthalten ist
          if (game.blockedips && game.blockedips.includes(hashedIp)) {
            console.log(`Verbindung von blockierter IP ${clientIp} wurde abgelehnt.`);
            socket.emit("error", { message: "Du bist für dieses Spiel gesperrt." });
            return; // Verhindert die Verbindung, wenn die IP blockiert ist
          }

          socket.join(gameId);
          socket.gameId = gameId;
          socket.playerId = playerId;

          if (!playerId) {
            console.error("PlayerId ist ungültig:", playerId);
            return;
          }

          const playerObjectId = new mongoose.Types.ObjectId(playerId);

          if (!activePlayersPerGame[gameId]) {
            activePlayersPerGame[gameId] = [];
          }

          const alreadyJoined = activePlayersPerGame[gameId].some(
            (p) => p.playerId === playerId
          );

          if (!alreadyJoined) {
            activePlayersPerGame[gameId].push({ playerId, username });
          }

          if (
            !game.players.some(
              (player) => player.playerId.toString() === playerObjectId.toString()
            )
          ) {
            console.log("Füge Spieler zur Datenbank hinzu");
            game.players.push({ playerId: playerObjectId, username });
            await game.save();
          } else {
            console.log("Spieler bereits in der Datenbank!");
          }

          io.to(gameId).emit("activePlayers", {
            players: activePlayersPerGame[gameId],
          });
        } catch (err) {
          console.error("Fehler beim Beitritt:", err);
        }
      });

      socket.on("error", ({ message }) => {
        console.error("Socket-Fehler:", message);
      });

      socket.on("watchGame", async ({ gameId }) => {
        console.log("Watcher tritt bei:", gameId);
        socket.join(gameId);

        console.log(activePlayersPerGame[gameId])
        if (activePlayersPerGame[gameId]) {
          io.to(gameId).emit("activePlayers", {
            players: activePlayersPerGame[gameId],
          });
        }
      });

      socket.on("startGame", async ({ gameId }) => {
        try {
          const game = await Game.findById(gameId);

          if (!game || !game.questions || game.questions.length === 0) {
            socket.emit("error", {
              message: "Keine Fragen im Spiel vorhanden.",
            });
            return;
          }

          game.started = true;
          game.currentQuestionIndex = 0;
          await game.save();

          await emitGameUpdate(io, gameId);

          const firstQuestion = game.questions[0];

          io.to(gameId).emit("gameStarted", { gameId });
          io.to(gameId).emit("newQuestion", {
            question: firstQuestion,
            index: 0,
            total: game.questions.length,
          });

          console.log(`Spiel ${gameId} wurde gestartet!`);
        } catch (error) {
          console.error("Fehler beim Starten des Spiels:", error);
          socket.emit("error", { message: "Spielstart fehlgeschlagen." });
        }
      });

      socket.on("submitAnswer", async ({ gameId, playerId, username, answer }) => {
        console.log("Antwort erhalten:", { gameId, playerId, username, answer });
        try {
          const game = await Game.findById(gameId)
            .populate("players", "username")
            .populate("questions")
            .lean();
          if (!game) {
            console.log("Spiel nicht gefunden");
            return;
          }

          const playerObjectId = new mongoose.Types.ObjectId(playerId);
          const playerIndex = game.players.findIndex(
            (player) => player.playerId.toString() === playerObjectId.toString()
          );

          if (playerIndex === -1) {
            console.log("Spieler nicht gefunden");
            return;
          }

          const questionObject = game.questions[game.currentQuestionIndex];
          const question = await Task.findById(questionObject._id);

          switch (question.mode) {
            case "multiple":
            case "open":
            case "buzzer":
            case "truefalse":
            case "picture":
              if (question.playeranswers.some((a) => a.playerId.toString() === playerObjectId.toString())) {
                console.log("Spieler hat bereits geantwortet.");
                return;
              }
              question.playeranswers.push(answer);
              await question.save();
              await emitGameUpdate(io, gameId);
              break;
          }
        } catch (error) {
          console.error("Fehler beim Speichern der Antwort:", error);
          socket.emit("error", { message: "Antwort konnte nicht gespeichert werden." });
        }
      });

      socket.on("showRightAnswer", async ({ gameId, showAnswer }) => {
        console.log("Empfangene gameId:", gameId);
        console.log("Empfangenes showAnswer:", showAnswer);

        if (gameId) {
          io.to(gameId).emit("showRightAnswerNow", showAnswer);
        } else {
          console.log("Kein gameId empfangen!");
        }
      });

      socket.on("nextQuestion", async ({ gameId }) => {
        try {
          const game = await Game.findById(gameId);
          if (!game) {
            socket.emit("error", { message: "Spiel nicht gefunden." });
            return;
          }

          if (game.currentQuestionIndex < game.questions.length - 1) {
            game.currentQuestionIndex++;
            await game.save();

            const nextQuestion = game.questions[game.currentQuestionIndex];

            io.to(gameId).emit("newQuestion", {
              question: nextQuestion,
              index: game.currentQuestionIndex,
              total: game.questions.length,
            });
          }
        } catch (error) {
          console.error("Fehler beim Laden der nächsten Frage:", error);
        }
      });

      socket.on("disconnect", () => {
        console.log("Ein Spieler hat das Spiel verlassen.");
      });
    });

    server.all("*", (req, res) => {
      return handle(req, res);
    });

    httpServer.listen(PORT, () =>
      console.log(`🚀 Server läuft auf http://localhost:${PORT}`)
    );
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });

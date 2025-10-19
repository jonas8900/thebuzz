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

function getClientIp(socket) {
  const rawIp =
  socket.handshake.headers["x-forwarded-for"]?.split(",")[0] || socket.handshake.address;

  const normalizeIp = (ip) => {
    if (ip === "::1") return "127.0.0.1";
    if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", ""); 
    return ip;
  };


  const clientIp = normalizeIp(rawIp);
  return clientIp;
}



async function emitGameUpdate(io, gameId) {
  try {
    const updatedGame = await Game.findById(gameId)
            .populate({
              path: "players.playerId", 
              select: "username points"  
            })
            .populate("admin", "username")
            .populate("scores.results.player")
            .populate("questions")
            .lean();
    if (updatedGame) {
      io.to(gameId).emit("gameUpdated", { game: updatedGame });
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
    console.log("MongoDB verbunden");
  })
  .catch((error) => console.log("MongoDB Fehler:", error));

console.log("Server wird vorbereitet...");

nextApp
  .prepare()
  .then(() => {
    console.log("Next.js ist bereit!");

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
        const clientIp = getClientIp(socket);

        try {
          const game = await Game.findById(gameId);

          if (!game) {
            console.log("Game nicht gefunden!");
            return;
          }

          const hashedIp = hashIp(clientIp);

          if (game.blockedips.includes(hashedIp)) {
            console.log(`Verbindung von blockierter IP wurde abgelehnt.`);
            socket.emit("banned", { message: "Du bist für dieses Spiel gesperrt." });
            await emitGameUpdate(io, gameId);
            return;
          }

          socket.join(gameId);
          socket.gameId = gameId;
          socket.playerId = playerId;

          if (!playerId) {
            console.error("PlayerId ist ungültig:", playerId);
            return;
          }

          const playerObjectId = new mongoose.Types.ObjectId(playerId);
          
          const player = await Temporary.findById(playerObjectId);

          if (!activePlayersPerGame[gameId]) {
            activePlayersPerGame[gameId] = [];
          }

          const alreadyJoined = activePlayersPerGame[gameId].some(
            (p) => p.playerId === playerId
          );

          if (!alreadyJoined) {
            if (player) {
              console.log("Player gefunden:", player); 
              const points = player.points !== undefined ? player.points : 0; 
              activePlayersPerGame[gameId].push({ playerId, username, points });
            } else {
              activePlayersPerGame[gameId].push({ playerId, username });
            }
          }
          
          const isPlayerInGame = game.players.some(
            (player) => player.playerId.toString() === playerObjectId.toString()
          );

          console.log("is player ingame", isPlayerInGame);

          if (!isPlayerInGame) {
            console.log("Füge Spieler zur Datenbank hinzu");
            game.players.push({ playerId: playerObjectId, username });
            await game.save();
          } else {
            console.log("Spieler bereits in der Datenbank!");
          }
      
          await emitGameUpdate(io, gameId);
          console.log("Aktive Spieler:", activePlayersPerGame[gameId]);
          console.log("Aktive Spieler in der Datenbank:", game.players);


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

        const clientIp = getClientIp(socket);

        const hashedIp = hashIp(clientIp);

        const game = await Game.findById(gameId).select("blockedips");
        if (!game) {
          console.log("Game nicht gefunden!");
          return;
        }

  


        if (game.blockedips.includes(hashedIp)) {
          console.log(`Verbindung von blockierter IP wurde abgelehnt.`);
          socket.emit("banned", { message: "Du bist für dieses Spiel gesperrt." });
          return;
        }

        socket.join(gameId);


        if (activePlayersPerGame[gameId]) {
          io.to(gameId).emit("activePlayers", {
            players: activePlayersPerGame[gameId],
          });
        }

        if(activePlayersPerGame[gameId] === undefined || activePlayersPerGame[gameId].length === 0 || activePlayersPerGame[gameId] === null) {
          activePlayersPerGame[gameId] = [];

          const game = await Game.findById(gameId);
          if(game) {
            game.players = [];
            await game.save();
          }
        }

        await emitGameUpdate(io, gameId);
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

      socket.on("buzzer", async ({ gameId, username }) => {
        if(gameId && username) {
          io.to(gameId).emit("buzzerPressed", { username });
          await emitGameUpdate(io, gameId);
        } else {
          console.log("Kein gameId empfangen!");
        }
      });

      socket.on("buzzerReset", async ({ gameId }) => {
        if(gameId) {
          io.to(gameId).emit("buzzerResetNow");

          const game = await Game.findById(gameId)
          .populate("players", "username")
          .populate("questions")
          .lean();
          if (!game) {
            console.log("Spiel nicht gefunden");
            return;
          }
          
          const questionObject = game.questions[game.currentQuestionIndex];
          const question = await Task.findById(questionObject._id);

            if (question) {
              if(question.playeranswers.length > 0) {
                question.playeranswers = [];
                await question.save();
                }
              }

            await emitGameUpdate(io, gameId);
          } else {
            console.log("Kein gameId empfangen!");
          }
      });

// Trigger eines States, damit die Spieler die richtige Antwort sehen können
      socket.on("showRightAnswer", async ({ gameId, showAnswer }) => {

          if (gameId) {
            io.to(gameId).emit("showRightAnswerNow", showAnswer);

            const game = await Game.findById(gameId);

            if (game && showAnswer) {
              const currentIndex = game.currentQuestionIndex;
              const currentQuestionInGame = game.questions[currentIndex];
              const currentId =  new mongoose.Types.ObjectId(currentQuestionInGame);
              const currentQuestion = await Task.findById(currentId);


              if (currentQuestion?.playeranswers?.length > 0 && currentQuestion.mode !== "buzzer" && currentQuestion.mode !== "open" && currentQuestion.mode !== "picture" && currentQuestion.pointsgiven === false) {
                for (const answer of currentQuestion.playeranswers) {
                  const playerObjectId = new mongoose.Types.ObjectId(answer.playerId);
                  const tempplayer = await Temporary.findById(playerObjectId);

                  if (tempplayer) {

                    if(answer.answer === currentQuestion.correctanswer && currentQuestion.mode !== "multiple") {
                      tempplayer.points += currentQuestion.points;
                      await tempplayer.save();
                    } else if(currentQuestion.mode === "multiple") {
                      const correctAnswerIndexInMultiple = parseInt(currentQuestion.correctanswer);
                      const correctAnswer = currentQuestion.answers[correctAnswerIndexInMultiple];
                      if(answer.answer === correctAnswer) {
                        tempplayer.points += currentQuestion.points;
                        await tempplayer.save();
                      }
                    }
                  }
                }
                currentQuestion.pointsgiven = true;
                await currentQuestion.save();
              }
              

              await emitGameUpdate(io, gameId);
            } else {
              console.log("Spiel nicht gefunden!");
            }

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


            await emitGameUpdate(io, gameId);
          } else {
            game.finished = true;
            await game.save(); 
            await emitGameUpdate(io, gameId);
            

            const TemporaryUsers = await Temporary.find({ yourgame: gameId, finalscore: false });

            if (TemporaryUsers.length === 0) {
              console.log("Es wurden keine Spieler mit diesen Kriterien gefunden.");
            } else {
              console.log("Gefundene Spieler:", TemporaryUsers);
            }


            const PlayerInCurrentGame = TemporaryUsers.filter((tempUser) => 
              activePlayersPerGame[gameId].some((player) => tempUser._id.toString() === player.playerId.toString())
            );

            console.log("Spieler in der aktuellen Runde:", PlayerInCurrentGame);

            const scoreSnapshot = {
              date: new Date(),
              results: PlayerInCurrentGame.map(user => ({
                player: user._id,        
                points: user.points,     
                username: user.username  
              }))
            };
           
            if (scoreSnapshot.results.length > 0) {
              game.scores.push(scoreSnapshot);
            } else {
              console.log("Keine Spieler gefunden für dieses Spiel, daher wird kein Snapshot hinzugefügt.");
            }

            game.started = false;
            game.currentQuestionIndex = 0;

            await Task.updateMany({ gameId: gameId }, { playeranswers: [], pointsgiven: false });
            await Temporary.updateMany({ yourgame: gameId }, { 
              points: 0,
            });
            await game.save();
            socket.emit("showRightAnswer", { gameId, showAnswer: false });

            await emitGameUpdate(io, gameId);

          }
        } catch (error) {
          console.error("Fehler beim Laden der nächsten Frage:", error);
        }
      });

      socket.on("removePoints", async ({ gameId, playerId, points }) => {
        try {
          const game = await Game.findById(gameId);
          const player = await Temporary.findById(playerId);
          if (!player) {
            socket.emit("error", { message: "Spieler nicht gefunden." });
            return;
          }
          if (!game) {
            socket.emit("error", { message: "Spiel nicht gefunden." });
            return;
          }

          player.points -= points;
          await player.save();

          await emitGameUpdate(io, gameId);
        } catch (error) {
          console.error("Fehler beim Entfernen der Punkte:", error);
        }
      });

      socket.on("setPointsToUser", async ({ gameId, playerId, points }) => {
        console.log("Punkte setzen:", { gameId, playerId, points });
        try {
          const game = await Game.findById(gameId);
          const player = await Temporary.findById(playerId);
          if (!player) {
            socket.emit("error", { message: "Spieler nicht gefunden." });
            return;
          }
          if (!game) {
            socket.emit("error", { message: "Spiel nicht gefunden." });
            return;
          }

          player.points += points;
          await player.save();

          await emitGameUpdate(io, gameId);
        } catch (error) {
          console.error("Fehler beim Setzen der Punkte:", error);
        }
      });

      socket.on("restartGame", async ({ gameId }) => {
        console.log("Spiel wird neu gestartet:", gameId);
        try {
          const game = await Game.findById(gameId);

          if (!game) {
            socket.emit("error", { message: "Spiel nicht gefunden." });
            return;

          }

          game.finished = false;
          game.currentQuestionIndex = 0;
          await game.save();
          await emitGameUpdate(io, gameId);


        } catch (error) {
          console.error("Fehler beim Neustarten des Spiels:", error);
          socket.emit("error", { message: "Spiel konnte nicht neu gestartet werden." });
        }
      });
    

      socket.on("disconnect", async () => {
        const gameId = socket.gameId;
        const playerId = socket.playerId;

        if (gameId && playerId) {
          if (activePlayersPerGame[gameId]) {
            activePlayersPerGame[gameId] = activePlayersPerGame[gameId].filter(
              (player) => player.playerId !== playerId
            );

            if (activePlayersPerGame[gameId].length === 0) {
              delete activePlayersPerGame[gameId];
            }

            io.to(gameId).emit("activePlayers", {
              players: activePlayersPerGame[gameId] || [],
            });
          }

          console.log(`Spieler ${playerId} hat das Spiel verlassen`);
          console.log("Aktive Spieler nach dem Entfernen:", activePlayersPerGame[gameId]);

          const currentGame = await Game.findById(gameId);
          if (currentGame) {
            currentGame.players = currentGame.players.filter(
              (player) => player.playerId.toString() !== playerId.toString()
            );

            try {
              await currentGame.save();
              console.log("Spieler aus der Datenbank entfernt:", playerId);
            } catch (err) {
              console.error("Fehler beim Speichern des Spiels:", err);
            }
          }

          socket.leave(gameId);
        }
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

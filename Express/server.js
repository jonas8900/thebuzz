const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const next = require("next");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config({ path: ".env.local" });

/**
 * Normalizes IPv6 loopback and IPv4-mapped IPv6 addresses to standard IPv4 format.
 */
function normalizeIp(ip = "") {
  if (!ip) return "unknown";
  const cleaned = String(ip).trim();
  if (cleaned === "::1") return "127.0.0.1";
  if (cleaned.startsWith("::ffff:")) return cleaned.slice(7);
  return cleaned;
}

/**
 * Hashes an IP address using SHA-256 for privacy-compliant ban checks.
 */
function hashIp(ip = "") {
  const normalized = normalizeIp(ip);
  if (/^[a-f0-9]{64}$/i.test(normalized)) return normalized.toLowerCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Extracts the real client IP from a Socket.IO connection behind reverse proxies (for coolify).
 */
function getClientIp(socket) {
  const xff = socket.handshake?.headers?.["x-forwarded-for"];
  const rawIp = Array.isArray(xff)
    ? xff[0]
    : xff?.split(",")[0]?.trim() || socket.handshake?.address || "unknown";
  return normalizeIp(rawIp);
}

const Game = require("../db/models/Game").default;
require("../db/models/User");
const Temporary = require("../db/models/Temporaryuser").default;
const Task = require("../db/models/Task").default;

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev, dir: "./" });
const handle = nextApp.getRequestHandler();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGODB_URI;

// In-memory state for active rooms, buzzer locks, and answer reveal flags
const activePlayersPerGame = {};
const buzzerLocks = {};
const revealedAnswersPerGame = {};

/**
 * Broadcasts the current game state to all clients in the room.
 * Strips question solutions (`correctanswer`) while answers are not revealed to prevent client-side inspection.
 */
async function emitGameUpdate(io, gameId) {
  try {
    if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) return;

    const query = Game.findById(gameId)
      .select("-blockedips -blockedusers")
      .populate({
        path: "players.playerId",
        select: "username points",
      })
      .populate("admin", "username")
      .populate("questions");

    // Populate historical score snapshots so end-of-game leaderboards render immediately
    query.populate("scores.results.player", "username points");

    const updatedGame = await query.lean();
    if (!updatedGame) return;

    const shouldReveal = Boolean(revealedAnswersPerGame[gameId]);
    if (!shouldReveal && Array.isArray(updatedGame.questions)) {
      updatedGame.questions = updatedGame.questions.map((q) => {
        if (!q || typeof q !== "object") return q;
        const { correctanswer, ...safeQuestion } = q;
        return safeQuestion;
      });
    }

    io.to(String(gameId)).emit("gameUpdated", { game: updatedGame });
  } catch (error) {
    console.error("Error in emitGameUpdate:", error);
  }
}

/**
 * Connects to MongoDB with automatic reconnection and periodic keep-alive pings
 * so MongoDB Atlas free-tier clusters do not pause.
 */
async function connectMongoWithKeepAlive() {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: process.env.DATABASE_NAME,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected");

    try {
      await mongoose.connection.collection("temporaryusers").dropIndex("username_1");
    } catch {
      // Index already dropped
    }

    const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
    setInterval(async () => {
      try {
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.db.admin().ping();
          await mongoose.connection.db
            .collection("games")
            .findOne({}, { projection: { _id: 1 } });
        }
      } catch (pingErr) {
        console.error("MongoDB keep-alive ping error:", pingErr.message);
      }
    }, SIX_HOURS_MS).unref();
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

connectMongoWithKeepAlive();

nextApp
  .prepare()
  .then(() => {
    const server = express();

    // Trust reverse proxy headers (Coolify Traefik / Heroku router)
    server.set("trust proxy", 1);

    const httpServer = http.createServer(server);
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_SERVER_URL || true,
        methods: ["GET", "POST"],
      },
      path: "/socket.io",
    });

    server.use(cors());

    io.on("connection", (socket) => {
      socket.on("joinGame", async ({ gameId, playerId, username }) => {
        if (!gameId || !playerId || !mongoose.Types.ObjectId.isValid(gameId) || !mongoose.Types.ObjectId.isValid(playerId)) {
          return;
        }

        const clientIp = getClientIp(socket);
        const hashedIp = hashIp(clientIp);

        try {
          const game = await Game.findById(gameId);
          if (!game) return;

          if (game.blockedips.includes(hashedIp)) {
            socket.emit("banned", { message: "Du bist für dieses Spiel gesperrt." });
            return;
          }

          const roomKey = String(gameId);
          socket.join(roomKey);
          socket.gameId = roomKey;
          socket.playerId = String(playerId);

          const playerObjectId = new mongoose.Types.ObjectId(playerId);

          // Store hashed IP on the temporary user record so admin kicks ban the player's IP, not the admin's IP
          const player = await Temporary.findByIdAndUpdate(
            playerObjectId,
            { $set: { ipHash: hashedIp } },
            { new: true }
          );

          if (!activePlayersPerGame[roomKey]) {
            activePlayersPerGame[roomKey] = [];
          }

          const existingIdx = activePlayersPerGame[roomKey].findIndex(
            (p) => String(p.playerId) === String(playerId)
          );

          const points = player?.points !== undefined ? player.points : 0;
          if (existingIdx === -1) {
            activePlayersPerGame[roomKey].push({
              playerId: String(playerId),
              username: player?.username || username,
              points,
            });
          } else {
            activePlayersPerGame[roomKey][existingIdx].points = points;
          }

          const isPlayerInGame = game.players.some(
            (p) => p.playerId && p.playerId.toString() === playerObjectId.toString()
          );

          if (!isPlayerInGame && String(game.admin) !== String(playerId)) {
            game.players.push({ playerId: playerObjectId, username: player?.username || username });
            await game.save();
          }

          await emitGameUpdate(io, roomKey);

          io.to(roomKey).emit("activePlayers", {
            players: activePlayersPerGame[roomKey],
          });
        } catch (err) {
          console.error("Error in joinGame:", err);
        }
      });

      socket.on("getUpdatedGame", async ({ gameId }) => {
        if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) return;
        const roomKey = String(gameId);
        socket.join(roomKey);
        await emitGameUpdate(io, roomKey);
      });

      socket.on("error", ({ message }) => {
        console.error("Socket error:", message);
      });

      socket.on("watchGame", async ({ gameId }) => {
        if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) return;

        try {
          const clientIp = getClientIp(socket);
          const hashedIp = hashIp(clientIp);
          const roomKey = String(gameId);

          const game = await Game.findById(roomKey).select("blockedips");
          if (!game) return;

          if (game.blockedips.includes(hashedIp)) {
            socket.emit("banned", { message: "Du bist für dieses Spiel gesperrt." });
            return;
          }

          socket.join(roomKey);

          if (!activePlayersPerGame[roomKey]) {
            activePlayersPerGame[roomKey] = [];
          }

          io.to(roomKey).emit("activePlayers", {
            players: activePlayersPerGame[roomKey],
          });

          await emitGameUpdate(io, roomKey);
        } catch (error) {
          console.error("Error in watchGame:", error);
        }
      });

      socket.on("kickPlayer", async ({ gameId, playerId }) => {
        if (!gameId || !playerId) return;
        const roomKey = String(gameId);

        if (activePlayersPerGame[roomKey]) {
          activePlayersPerGame[roomKey] = activePlayersPerGame[roomKey].filter(
            (p) => String(p.playerId) !== String(playerId)
          );
          io.to(roomKey).emit("activePlayers", {
            players: activePlayersPerGame[roomKey],
          });
        }

        // Notify the kicked player's socket immediately
        const roomSockets = await io.in(roomKey).fetchSockets();
        for (const s of roomSockets) {
          if (String(s.playerId) === String(playerId)) {
            s.emit("banned", { message: "Du wurdest vom Spielleiter aus dem Spiel entfernt." });
            s.leave(roomKey);
          }
        }

        await emitGameUpdate(io, roomKey);
      });

      socket.on("startGame", async ({ gameId }) => {
        try {
          if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) return;
          const roomKey = String(gameId);

          const game = await Game.findById(roomKey);
          if (!game || !game.questions || game.questions.length === 0) {
            socket.emit("error", { message: "Keine Fragen im Spiel vorhanden." });
            return;
          }

          // Shuffle questions if gamemode is set to random
          if (game.gamemode === "random" && game.questions.length > 1) {
            for (let i = game.questions.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [game.questions[i], game.questions[j]] = [game.questions[j], game.questions[i]];
            }
          }

          delete buzzerLocks[roomKey];
          revealedAnswersPerGame[roomKey] = false;

          game.started = true;
          game.finished = false;
          game.currentQuestionIndex = 0;
          await game.save();

          await emitGameUpdate(io, roomKey);

          const firstQuestion = game.questions[0];
          io.to(roomKey).emit("gameStarted", { gameId: roomKey });
          io.to(roomKey).emit("newQuestion", {
            question: firstQuestion,
            index: 0,
            total: game.questions.length,
          });
        } catch (error) {
          console.error("Error starting game:", error);
          socket.emit("error", { message: "Spielstart fehlgeschlagen." });
        }
      });

      socket.on("submitAnswer", async ({ gameId, playerId, username, answer }) => {
        try {
          if (!gameId || !playerId || !answer || !mongoose.Types.ObjectId.isValid(gameId) || !mongoose.Types.ObjectId.isValid(playerId)) {
            return;
          }
          const roomKey = String(gameId);

          // Fast in-memory lock check for buzzer answers to prevent race conditions under load
          if (answer.answer === true) {
            if (buzzerLocks[roomKey] && buzzerLocks[roomKey] !== String(playerId)) {
              return;
            }
            buzzerLocks[roomKey] = String(playerId);
          }

          const game = await Game.findById(roomKey)
            .select("players questions currentQuestionIndex started")
            .lean();
          if (!game || !game.started) return;

          const playerObjectId = new mongoose.Types.ObjectId(playerId);
          const isPlayerInGame = game.players.some(
            (p) => p.playerId && p.playerId.toString() === playerObjectId.toString()
          );
          if (!isPlayerInGame) return;

          const currentQuestionId = game.questions[game.currentQuestionIndex];
          if (!currentQuestionId) return;

          // Atomic update ensures a player can only submit once per question even on rapid clicks
          const updatedQuestion = await Task.findOneAndUpdate(
            {
              _id: currentQuestionId,
              "playeranswers.playerId": { $ne: playerObjectId },
            },
            {
              $push: {
                playeranswers: {
                  playerId: playerObjectId,
                  username: answer.username || username,
                  answer: String(answer.answer),
                },
              },
            },
            { new: true }
          );

          if (updatedQuestion) {
            await emitGameUpdate(io, roomKey);
          }
        } catch (error) {
          console.error("Error saving answer:", error);
          socket.emit("error", { message: "Antwort konnte nicht gespeichert werden." });
        }
      });

      socket.on("buzzer", async ({ gameId, username }) => {
        if (!gameId || !username) return;
        const roomKey = String(gameId);

        // Only emit buzzerPressed for the player holding the lock
        if (socket.playerId && buzzerLocks[roomKey] && buzzerLocks[roomKey] !== String(socket.playerId)) {
          return;
        }
        if (!buzzerLocks[roomKey] && socket.playerId) {
          buzzerLocks[roomKey] = String(socket.playerId);
        }

        io.to(roomKey).emit("buzzerPressed", { username });
        await emitGameUpdate(io, roomKey);
      });

      socket.on("buzzerReset", async ({ gameId }) => {
        if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) return;
        const roomKey = String(gameId);

        delete buzzerLocks[roomKey];
        io.to(roomKey).emit("buzzerResetNow");

        try {
          const game = await Game.findById(roomKey)
            .select("questions currentQuestionIndex")
            .lean();
          if (!game) return;

          const currentQuestionId = game.questions[game.currentQuestionIndex];
          if (currentQuestionId) {
            await Task.findByIdAndUpdate(currentQuestionId, {
              $set: { playeranswers: [] },
            });
          }

          await emitGameUpdate(io, roomKey);
        } catch (error) {
          console.error("Error in buzzerReset:", error);
        }
      });

      socket.on("showRightAnswer", async ({ gameId, showAnswer }) => {
        if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) return;
        const roomKey = String(gameId);

        try {
          revealedAnswersPerGame[roomKey] = Boolean(showAnswer);
          const game = await Game.findById(roomKey).select("questions currentQuestionIndex");

          if (game && showAnswer) {
            const currentQuestionId = game.questions[game.currentQuestionIndex];
            const currentQuestion = await Task.findById(currentQuestionId);

            if (
              currentQuestion?.playeranswers?.length > 0 &&
              currentQuestion.mode !== "buzzer" &&
              currentQuestion.mode !== "open" &&
              currentQuestion.mode !== "picture" &&
              currentQuestion.pointsgiven === false
            ) {
              const winningPlayerIds = [];

              for (const answer of currentQuestion.playeranswers) {
                if (!answer.playerId) continue;

                if (currentQuestion.mode === "multiple") {
                  const correctIndex = parseInt(currentQuestion.correctanswer, 10);
                  const expectedAnswer = currentQuestion.answers?.[correctIndex];
                  if (answer.answer === expectedAnswer) {
                    winningPlayerIds.push(new mongoose.Types.ObjectId(answer.playerId));
                  }
                } else if (String(answer.answer) === String(currentQuestion.correctanswer)) {
                  winningPlayerIds.push(new mongoose.Types.ObjectId(answer.playerId));
                }
              }

              // Single bulk update instead of N+1 sequential queries
              if (winningPlayerIds.length > 0) {
                await Temporary.updateMany(
                  { _id: { $in: winningPlayerIds } },
                  { $inc: { points: currentQuestion.points } }
                );
              }

              currentQuestion.pointsgiven = true;
              await currentQuestion.save();
            }
          }

          // Emit updated game (including correctanswer when showAnswer is true) before toggling UI state
          await emitGameUpdate(io, roomKey);
          io.to(roomKey).emit("showRightAnswerNow", Boolean(showAnswer));
        } catch (error) {
          console.error("Error in showRightAnswer:", error);
        }
      });

      socket.on("nextQuestion", async ({ gameId }) => {
        try {
          if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) return;
          const roomKey = String(gameId);

          delete buzzerLocks[roomKey];
          revealedAnswersPerGame[roomKey] = false;

          const game = await Game.findById(roomKey);
          if (!game) {
            socket.emit("error", { message: "Spiel nicht gefunden." });
            return;
          }

          if (game.currentQuestionIndex < game.questions.length - 1) {
            game.currentQuestionIndex++;
            await game.save();

            const nextQuestion = game.questions[game.currentQuestionIndex];
            io.to(roomKey).emit("newQuestion", {
              question: nextQuestion,
              index: game.currentQuestionIndex,
              total: game.questions.length,
            });
            io.to(roomKey).emit("showRightAnswerNow", false);

            await emitGameUpdate(io, roomKey);
          } else {
            game.finished = true;

            const temporaryUsers = await Temporary.find({
              yourgame: roomKey,
              finalscore: false,
            }).lean();

            const activeList = activePlayersPerGame[roomKey] || [];
            const playersInCurrentGame =
              activeList.length > 0
                ? temporaryUsers.filter((tempUser) =>
                    activeList.some((p) => String(p.playerId) === String(tempUser._id))
                  )
                : temporaryUsers;

            const scoreSnapshot = {
              date: new Date(),
              results: playersInCurrentGame.map((user) => ({
                player: user._id,
                points: user.points,
                username: user.username,
              })),
            };

            if (scoreSnapshot.results.length > 0) {
              game.scores.push(scoreSnapshot);
            }

            game.started = false;
            game.currentQuestionIndex = 0;

            await Promise.all([
              Task.updateMany({ gameId: roomKey }, { playeranswers: [], pointsgiven: false }),
              Temporary.updateMany({ yourgame: roomKey }, { points: 0 }),
              game.save(),
            ]);

            io.to(roomKey).emit("showRightAnswerNow", false);
            await emitGameUpdate(io, roomKey);
          }
        } catch (error) {
          console.error("Error loading next question:", error);
        }
      });

      socket.on("removePoints", async ({ gameId, playerId, points }) => {
        try {
          if (!gameId || !playerId) return;
          const roomKey = String(gameId);

          const player = await Temporary.findByIdAndUpdate(
            playerId,
            { $inc: { points: -Number(points || 0) } },
            { new: true }
          );

          if (!player) {
            socket.emit("error", { message: "Spieler nicht gefunden." });
            return;
          }

          await emitGameUpdate(io, roomKey);
        } catch (error) {
          console.error("Error removing points:", error);
        }
      });

      socket.on("setPointsToUser", async ({ gameId, playerId, points }) => {
        try {
          if (!gameId || !playerId) return;
          const roomKey = String(gameId);

          const player = await Temporary.findByIdAndUpdate(
            playerId,
            { $inc: { points: Number(points || 0) } },
            { new: true }
          );

          if (!player) {
            socket.emit("error", { message: "Spieler nicht gefunden." });
            return;
          }

          await emitGameUpdate(io, roomKey);
        } catch (error) {
          console.error("Error awarding points:", error);
        }
      });

      socket.on("restartGame", async ({ gameId }) => {
        try {
          if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) return;
          const roomKey = String(gameId);

          delete buzzerLocks[roomKey];
          revealedAnswersPerGame[roomKey] = false;

          const game = await Game.findByIdAndUpdate(
            roomKey,
            { $set: { finished: false, currentQuestionIndex: 0 } },
            { new: true }
          );

          if (!game) {
            socket.emit("error", { message: "Spiel nicht gefunden." });
            return;
          }

          await emitGameUpdate(io, roomKey);
        } catch (error) {
          console.error("Error restarting game:", error);
          socket.emit("error", { message: "Spiel konnte nicht neu gestartet werden." });
        }
      });

      socket.on("disconnect", async () => {
        const gameId = socket.gameId;
        const playerId = socket.playerId;

        if (gameId && playerId) {
          if (activePlayersPerGame[gameId]) {
            activePlayersPerGame[gameId] = activePlayersPerGame[gameId].filter(
              (player) => String(player.playerId) !== String(playerId)
            );

            if (activePlayersPerGame[gameId].length === 0) {
              delete activePlayersPerGame[gameId];
            }

            io.to(gameId).emit("activePlayers", {
              players: activePlayersPerGame[gameId] || [],
            });
          }

          try {
            const currentGame = await Game.findById(gameId);
            if (currentGame) {
              currentGame.players = currentGame.players.filter(
                (player) => player.playerId && player.playerId.toString() !== playerId.toString()
              );
              await currentGame.save();
            }
          } catch (err) {
            console.error("Error removing disconnected player from game:", err);
          }

          socket.leave(gameId);
        }
      });
    });

    server.all("*", (req, res) => {
      return handle(req, res);
    });

    httpServer.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });

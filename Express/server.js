const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const next = require("next");
const cors = require("cors");
const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const Game = require("../db/models/Game").default;
const User = require("../db/models/User").default;
const Temporary = require("../db/models/Temporaryuser").default;

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGO_URI, {
    dbName: process.env.DATABASE_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB verbunden");
  })
  .catch((error) => console.log(error));

app.prepare().then(() => {
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

  server.get("/api/gamemechanic/getGameById", async (req, res) => {
    const { x: gameId } = req.query;
    try {
      const game = await Game.findById(gameId);
      if (!game) return res.status(404).send("Game not found");
      res.json(game);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  const activePlayers = {};

  io.on("connection", (socket) => {
    console.log(`🟢 Client verbunden: ${socket.id}`);

    socket.on('joinGame', async ({ gameId, playerId, username }) => {

      const game = await Game.findById(gameId);
      if (!game) {
        socket.emit('error', { message: "Game not found" });
        return;
      }

      if (!game.players.includes(playerId)) {
        game.players.push(playerId);
        await game.save();
      }

      activePlayers[playerId] = { socketId: socket.id, username };


      const activePlayerIds = Object.keys(activePlayers);
      const activeGamePlayers = game.players
        .filter(player => activePlayerIds.includes(player.toString()))
        .map(playerId => {
          const playerSocket = activePlayers[playerId];
          return { username: playerSocket.username };
        });

      io.emit('activePlayers', {
        gameId,
        players: activeGamePlayers,
      });
    });

    socket.on('disconnect', async () => {
      const playerId = Object.keys(activePlayers).find(key => activePlayers[key].socketId === socket.id);
    
      if (playerId) {

        delete activePlayers[playerId];
    
    
        const game = await Game.findOne({ players: playerId });
    
        if (game) {
          game.players = game.players.filter(player => !player.equals(playerId));
          await game.save();
    
          const activeGamePlayers = game.players
            .map(playerId => {
              const playerSocket = activePlayers[playerId];
              return { username: playerSocket?.username };
            });
    
          io.emit('activePlayers', {
            gameId: game._id,
            players: activeGamePlayers,
          });
        }
      }
    });
    
  });

  server.all("*", (req, res) => handle(req, res));

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
  });
});

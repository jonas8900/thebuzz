const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const next = require('next');
const cors = require('cors');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 4000;

app.prepare().then(() => {
    const server = express();
    const httpServer = http.createServer(server);
    const io = new Server(httpServer, {
        cors: {
            origin: "*", // Testweise, später spezifische URL erlauben
            methods: ["GET", "POST"]
        },
        path: '/socket.io', // Wichtig, um Route korrekt zu definieren
    });

    server.use(cors()); // Cors für Express erlauben

    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.id}`);

        socket.on('sendTimestamp', (timestamp) => {
            console.log(`📅 Timestamp received: ${timestamp}`);
            io.emit('receiveTimestamp', timestamp); 
        });

        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.id}`);
        });
    });

    server.all('*', (req, res) => handle(req, res));

    httpServer.listen(PORT, () => {
        console.log(`Server is listening at http://localhost:${PORT}`);
    });
});

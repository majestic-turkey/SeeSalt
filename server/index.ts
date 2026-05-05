import express from 'express';
import {Server, Socket} from 'socket.io';
import http from 'http';
import path from 'path';
import type { ClientToServerEvents, ServerToClientEvents } from './types.ts';
import { fileURLToPath } from 'url';
import { addStrokeToRoom, getRoom, joinRoom, leaveRoom } from './rooms.ts';

// Create an Express application and mount middleware
const app = express();
const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server)

// Get the file path of the index.html file in the client/dist directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, '../client/dist');

// Serve static files from the client/dist directory
app.use(express.static(clientDist));


// Serve the app from the 'dist' directory
app.get('/', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
});

// Handle Socket.IO connections
io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log('a user connected');

    // Listen for 'join-room' events from the client
    socket.on('join-room', ({ roomId, username }) => {
        console.log(`${username} joined room ${roomId}`);
        socket.join(roomId);
        joinRoom(roomId, { id: socket.id, username });

        socket.data.roomId = roomId;
        socket.data.username = username;

        io.to(roomId).emit('room-users', getRoom(roomId)!.users);

        // Send existing strokes to the newly joined user
        if (getRoom(roomId).strokes.length > 0) {
            const strokeReplay = getRoom(roomId).strokes;
            strokeReplay.forEach(stroke => {
                socket.emit('draw-canvas', stroke);
            });
        }
    });

    // Listen for 'on-draw' events from the client
    socket.on('on-draw', (payload) => {
        const { roomId } = socket.data;
        if (!roomId) return;
        addStrokeToRoom(roomId, payload);
        socket.to(roomId).emit('draw-canvas', payload);
    });

    // Cleanup on disconnect
    socket.on('disconnect', () => {
        console.log('user disconnected');
        const { roomId } = socket.data;
        if (!roomId) return;

        leaveRoom(roomId, socket.id);

        const room = getRoom(roomId);
        io.to(roomId).emit('room-users', room?.users ?? []);
    })
});

// Fallback route for unmatched routes
app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`);
});
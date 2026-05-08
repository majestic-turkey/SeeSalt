import express from 'express';
import {Server, Socket} from 'socket.io';
import http from 'http';
import path from 'path';
import type { ClientToServerEvents, ServerToClientEvents } from './types.ts';
import { fileURLToPath } from 'url';
import { addStrokeToRoom, addChatMessageToRoom, getRoom, joinRoom, leaveRoom } from './rooms.ts';

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

    // Listen for 'join-room' events from the client
    socket.on('join-room', ({ roomId, username }) => {
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

    // Listen for 'cursor-move' events from the client
    socket.on('cursor-move', (payload) => {
        const { roomId, username } = socket.data;
        if (!roomId || !username) return;
        socket.to(roomId).emit('cursor-update', { ...payload });
    });

    // Listen for 'undo' events from the client
    socket.on('undo', (payload) => {
        const { roomId } = socket.data;
        if (!roomId) return;
        const room = getRoom(roomId);
        if (!room) return;
        room.strokes = room.strokes.filter(stroke => stroke.strokeId !== payload.strokeId);
        socket.to(roomId).emit('undo-canvas', payload);
    });

    // Listen for 'send-chat-message' events from the client
    socket.on('send-chat-message', (message) => {
        const { roomId, username } = socket.data;
        if (!roomId || !username) return;
        const chatMessage = { socketId: socket.id, username, message, timestamp: Date.now() };
        addChatMessageToRoom(roomId, chatMessage);
        io.to(roomId).emit('chat-message', chatMessage);
    });

    // Send chat history to a client on request
    socket.on('get-chat-history', () => {
        const { roomId } = socket.data;
        if (!roomId) return;
        const room = getRoom(roomId);
        if (!room) return;
        socket.emit('chat-message', room.chatHistory);
    });

    // Cleanup on disconnect
    socket.on('disconnect', () => {
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
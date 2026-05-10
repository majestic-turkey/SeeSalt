import express from 'express';
import { Server, Socket } from 'socket.io';
import http from 'http';
import path from 'path';
import type { ClientToServerEvents, ServerToClientEvents } from './types.ts';
import { fileURLToPath } from 'url';
import { addStrokeToRoom, addChatMessageToRoom, getRoom, joinRoom, leaveRoom } from './rooms.ts';
import { type GameState, startGame, getGameState, handleCorrectGuess, handlePlayerLeave } from './game.ts';

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

        // Send chat history to the new joiner
        const history = getRoom(roomId).chatHistory;
        if (history.length > 0) {
            socket.emit('chat-message', history);
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

        // Emit the new chat message to all clients in the room
        io.to(roomId).emit('chat-message', chatMessage);

        // Handle guesses from the non-drawer
        const newState = getGameState(roomId);
        if (newState && newState.isPlaying && newState.currentDrawerId !== socket.id) {
            const guess = message.trim().toLowerCase();
            const word = newState.currentWord?.toLowerCase();
            if (guess === word) {
                const updatedState = handleCorrectGuess(roomId, getRoom(roomId)?.users ?? [], () => {
                    io.to(roomId).emit('next-turn', {
                        drawerId: updatedState.currentDrawerId!,
                        drawerUsername: getRoom(roomId)?.users.find(u => u.id === updatedState.currentDrawerId)?.username ?? ''
                    });
                    io.to(updatedState.currentDrawerId!).emit('your-word', updatedState.currentWord)
                });
                io.to(roomId).emit('correct-guess', { username, word: updatedState.currentWord! });
            }
        }
    });

    socket.on('get-chat-history', () => {
        const { roomId } = socket.data;
        if (!roomId) return;
        const history = getRoom(roomId)?.chatHistory ?? [];
        socket.emit('chat-message', history);
    });

    // Listen for 'start-game' events from the client
    socket.on('start-game', () => {
        const gameState: GameState = startGame(socket.data.roomId, getRoom(socket.data.roomId)?.users ?? []);
        if (!gameState) return;
        io.to(socket.data.roomId).emit('game-started', {
            currentDrawerId: gameState.currentDrawerId,
            drawerIndex: gameState.drawerIndex
        });
        if (!gameState.currentDrawerId) return;
        io.to(gameState.currentDrawerId).emit('your-word', gameState.currentWord);
    });

    // Cleanup on disconnect
    socket.on('disconnect', () => {
        const { roomId } = socket.data;
        if (!roomId) return;

        leaveRoom(roomId, socket.id);

        const newState = handlePlayerLeave(roomId, socket.id, getRoom(roomId)?.users ?? []);
        const room = getRoom(roomId);
        io.to(roomId).emit('room-users', room?.users ?? []);

        if (!newState?.isPlaying) return;

        io.to(roomId).emit('next-turn', {
            drawerId: newState?.currentDrawerId!,
            drawerUsername: getRoom(roomId)?.users.find(u => u.id === newState?.currentDrawerId)?.username ?? ''
        });

        io.to(newState.currentDrawerId!).emit('your-word', newState.currentWord);
    })
});

// Fallback route for unmatched routes
app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
import express from 'express';
import {Server, Socket} from 'socket.io';
import http from 'http';
import path from 'path';
import type { ClientToServerEvents, ServerToClientEvents } from './types.ts';
import { fileURLToPath } from 'url';

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

    socket.on('disconnect', () => {
        console.log('user disconnected');
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
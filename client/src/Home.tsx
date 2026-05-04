import { io, Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '../../server/types.ts';
import type { JSX } from 'react';

// This is a simple component that connects to the Socket.IO server and emits a 'join-room' event when the button is clicked. It also listens for 'room-users' events to log the current users in the room.
function fireMessage(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
    socket.emit('join-room', { roomId: 'test-room', username: 'test-user' });
}

export default function Home(): JSX.Element {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
    socket.on('room-users', (users) => {
        console.log('Current users in room:', users);
    });

    return (
        <div>
            <button onClick={() => fireMessage(socket)}>Fire Message</button>
        </div>
    )
}
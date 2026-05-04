import { io, Socket } from 'socket.io-client'
import { Route, Routes } from 'react-router-dom'
import type { ClientToServerEvents, ServerToClientEvents } from '../../server/types.ts';
import { type JSX, useEffect } from 'react';
import socketStore from './store/useStore.ts';



function App(): JSX.Element {
  const { setSocket } = socketStore();

  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:3000');
    setSocket(socket);

    socket.on('room-users', (users) => {
      console.log('Users in room:', users);
    });

    return () => {
      socket.disconnect();
    };
  }, [setSocket]);


  return (
    <Routes>
      <Route path="/" element={<button onClick={() => socketStore.getState().socket?.emit('join-room', { roomId: 'Wonderland', username: 'Alice' })}>Join Room</button>} />
    </Routes>
  )
}

export default App

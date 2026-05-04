import { io, Socket } from 'socket.io-client'
import { Route, Routes } from 'react-router-dom'
import type { ClientToServerEvents, ServerToClientEvents } from './types.ts';
import { type JSX, useEffect } from 'react';
import useStore from './store/useStore.ts';
import Lobby from './components/Lobby.tsx';

function App(): JSX.Element {
  const { setSocket } = useStore();

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
      <Route path="/" element={<Lobby />} />
    </Routes>
  )
}

export default App

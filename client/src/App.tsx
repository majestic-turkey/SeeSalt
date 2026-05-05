import { io, Socket } from 'socket.io-client'
import { Route, Routes } from 'react-router-dom'
import type { ClientToServerEvents, ServerToClientEvents } from './types.ts';
import { type JSX, useEffect } from 'react';
import useStore from './store/useStore.ts';
import Lobby from './components/Lobby.tsx';
import Room from './components/Room.tsx';

function App(): JSX.Element {
  const { setSocket, setUsers } = useStore();

  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:3000');
    setSocket(socket);

    socket.on('room-users', (users) => {
      setUsers(users);
    });

    return () => {
      socket.disconnect();
    };
  }, [setSocket, setUsers]);


  return (
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path="/room/:roomId" element={<Room />} />
    </Routes>
  )
}

export default App

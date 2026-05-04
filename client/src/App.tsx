import { io, Socket } from 'socket.io-client'
import { Route, Routes } from 'react-router-dom'
import Home from './Home.tsx'
import type { ClientToServerEvents, ServerToClientEvents } from '../../server/types.ts';
import type { JSX } from 'react';

function App(): JSX.Element {
  const socket: Socket<ClientToServerEvents, ServerToClientEvents> = io('http://localhost:3000');

  socket.on('connect', () => {
    console.log('connected to server');
  });

  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  )
}

export default App

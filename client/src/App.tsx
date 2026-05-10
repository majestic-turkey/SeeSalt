import { io, Socket } from 'socket.io-client'
import { Route, Routes } from 'react-router-dom'
import type { ClientToServerEvents, ServerToClientEvents } from './types.ts';
import { type JSX, useEffect } from 'react';
import useStore from './store/useStore.ts';
import Lobby from './components/Lobby.tsx';
import Room from './components/Room.tsx';

function App(): JSX.Element {
  const { setSocket, setUsers, setIsPlaying, setCurrentDrawerId, setCurrentWord } = useStore();

  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
    setSocket(socket);

    socket.on('room-users', (users) => {
      setUsers(users);
    });

    socket.on('game-started', (state) => {
      setIsPlaying(true)
      setCurrentDrawerId(state.currentDrawerId)
    })

    socket.on('your-word', (word) => {
      setCurrentWord(word)
    })

    socket.on('next-turn', (state) => {
      setCurrentDrawerId(state.drawerId)
      setCurrentWord(null) // clear word for everyone, drawer gets it via your-word
    })

    socket.on('correct-guess', (payload) => {
      alert(`${payload.username} guessed the word "${payload.word}" correctly!`)
    })

    return () => {
      socket.off('game-started')
      socket.off('your-word')
      socket.off('next-turn')
      socket.off('correct-guess')
      socket.off('room-users')
      socket.disconnect();
    };
  }, [setSocket, setUsers, setIsPlaying, setCurrentDrawerId, setCurrentWord]);


  return (
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path="/room/:roomId" element={<Room />} />
    </Routes>
  )
}

export default App

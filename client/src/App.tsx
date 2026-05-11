import { io, Socket } from 'socket.io-client'
import { Route, Routes } from 'react-router-dom'
import type { ClientToServerEvents, ServerToClientEvents, User } from './types.ts';
import { type JSX, useEffect } from 'react';
import useStore from './store/useStore.ts';
import Lobby from './components/Lobby.tsx';
import Room from './components/Room.tsx';

function App(): JSX.Element {
  const { setSocket, setUsers, setIsPlaying, setCurrentDrawerId, setCurrentWord } = useStore();

  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
    setSocket(socket);

    const handleRoomUsers = (users: User[]) => {
      setUsers(users);
    }

    socket.on('room-users', handleRoomUsers);

    const handleGameStarted = (state: { currentDrawerId: string }) => {
      setIsPlaying(true)
      setCurrentDrawerId(state.currentDrawerId)
    }
    socket.on('game-started', handleGameStarted);

    const handleYourWord = (word: string) => {
      setCurrentWord(word)
    }
    socket.on('your-word', handleYourWord);

    const handleNextTurn = (state: { drawerId: string }) => {
      setCurrentDrawerId(state.drawerId)
      setCurrentWord(null) // clear word for everyone, drawer gets it via your-word
    }
    socket.on('next-turn', handleNextTurn);

    const handleCorrectGuess = (payload: { username: string; word: string }) => {
      console.log('correct guess:', payload)
    }
    socket.on('correct-guess', handleCorrectGuess);

    return () => {
      socket.off('game-started', handleGameStarted)
      socket.off('your-word', handleYourWord)
      socket.off('next-turn', handleNextTurn)
      socket.off('correct-guess', handleCorrectGuess)
      socket.off('room-users', handleRoomUsers)
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

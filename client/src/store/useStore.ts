import { create } from 'zustand';
import type { ClientToServerEvents, ServerToClientEvents } from '../types';
import { Socket } from 'socket.io-client';

// Create a Zustand store to hold the socket instance
const useSocketStore = create<{
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  setSocket: (socket: Socket<ServerToClientEvents, ClientToServerEvents>) => void;
}>((set) => ({
  socket: null,
  setSocket: (socket) => set({ socket }),
}));

export default useSocketStore;
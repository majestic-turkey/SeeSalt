import { create } from 'zustand';
import type { ClientToServerEvents, ServerToClientEvents, User } from '../types';
import { Socket } from 'socket.io-client';

interface StoreState {
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
    setSocket: (socket: Socket<ServerToClientEvents, ClientToServerEvents>) => void;

    username: string;
    setUsername: (username: string) => void;

    roomId: string | null;
    setRoomId: (roomId: string) => void;

    users: User[];
    setUsers: (users: User[]) => void;
}

// Create a Zustand store to hold the socket instance
const useStore = create<StoreState>((set) => ({
    socket: null,
    setSocket: (socket) => set({ socket }),
    username: '',
    setUsername: (username) => set({ username }),
    roomId: null,
    setRoomId: (roomId) => set({ roomId }),
    users: [],
    setUsers: (users) => set({ users }),
}));

export default useStore;
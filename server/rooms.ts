import type { Room } from './types.ts';

const rooms: Record<string, Room> = {};

export function getRoom (roomId: string) {
    return rooms[roomId];
}

export function joinRoom (roomId: string, user: { id: string; username: string }) {
    if (!rooms[roomId]) {
        rooms[roomId] = { id: roomId, users: [] };
    }
    rooms[roomId].users.push(user);
}

export function leaveRoom (roomId: string, userId: string) {
    if (!rooms[roomId]) return;
    rooms[roomId].users = rooms[roomId].users.filter(user => user.id !== userId);
    if (rooms[roomId].users.length === 0) {
        delete rooms[roomId];
    }
}
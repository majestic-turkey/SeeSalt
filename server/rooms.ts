import type { Room, StrokeSegment } from './types.ts';

const rooms: Record<string, Room & { strokes: StrokeSegment[] }> = {};

export function getRoom (roomId: string) {
    return rooms[roomId];
}

export function joinRoom (roomId: string, user: Room["users"][number]) {
    if (!rooms[roomId]) {
        rooms[roomId] = { id: roomId, users: [], strokes: [] };
    }
    rooms[roomId].users.push(user);
}

export function addStrokeToRoom (roomId: string, stroke: StrokeSegment) {
    const room = rooms[roomId];
    if (!room) return;
    room.strokes.push(stroke);
}

export function leaveRoom (roomId: string, userId: string) {
    if (!rooms[roomId]) return;
    rooms[roomId].users = rooms[roomId].users.filter(user => user.id !== userId);
    if (rooms[roomId].users.length === 0) {
        delete rooms[roomId];
    }
}
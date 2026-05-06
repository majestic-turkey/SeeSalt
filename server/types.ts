export interface User {
    id: string
    username: string
}

export interface ClientToServerEvents {
    'join-room': (payload: { roomId: string; username: string }) => void
    'on-draw': (payload: StrokeSegment) => void
}

export interface ServerToClientEvents {
    'room-users': (users: User[]) => void
    'draw-canvas': (payload: StrokeSegment) => void
}

export interface Room {
    id: string;
    users: { id: string; username: string }[];
    strokes: StrokeSegment[];
}

export interface StrokeSegment {
    x0: number; y0: number; // From coordinates
    x1: number; y1: number; // To coordinates
    color: string; // Stroke color
    width: number; // Stroke width
}

export interface User {
    id: string
    username: string
}

export interface ClientToServerEvents {
    'join-room': (payload: { roomId: string; username: string}) => void
    'on-draw': (payload: StrokeSegment) => void
    'cursor-move': (payload: { x: number; y: number; username: string; userId: string }) => void
    'undo': (payload: { strokeId: string; userId: string }) => void
}

export interface ServerToClientEvents {
    'room-users': (users: User[]) => void
    'draw-canvas': (payload: StrokeSegment) => void
    'cursor-update': (payload: { x: number; y: number; username: string; userId: string }) => void
    'undo-canvas': (payload: { strokeId: string; userId: string }) => void
}

export interface StrokeSegment {
    x0: number; y0: number; // From coordinates
    x1: number; y1: number; // To coordinates
    color: string; // Stroke color
    width: number; // Stroke width
    userId: string; // ID of the user who drew this segment
    strokeId: string; // Unique ID for this stroke segment
}

export interface User {
    id: string
    username: string
}

export interface ClientToServerEvents {
    'join-room': (payload: { roomId: string; username: string}) => void
}

export interface ServerToClientEvents {
    'room-users': (users: User[]) => void
}
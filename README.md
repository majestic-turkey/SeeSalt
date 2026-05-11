# SeeSalt

SeeSalt is a real-time collaborative drawing app with room-based sessions.
Version 1.0.0 is the first stable release.

Users can create or join a room, draw together on a shared canvas, see online participants, chat, and play turn-based drawing rounds.

## What it does

- Real-time collaborative drawing over WebSockets (Socket.IO)
- Room-based collaboration with auto-generated room codes
- Shared canvas state replay for newly joined users
- User presence list per room
- Live remote cursor positions
- In-room real-time chat
- Turn-based game flow with a Start Game action
- Brush, eraser, stroke size, and color controls
- Undo for your most recent stroke
- Export current canvas to PNG

## Tech stack

### Client

- React 19 + TypeScript + Vite
- Zustand for client state
- Socket.IO client

### Server

- Node.js + TypeScript
- Express 5
- Socket.IO
- In-memory room and stroke storage

## Project structure

```text
SeeSalt/
  client/   # React app (UI, canvas interaction)
  server/   # Express + Socket.IO backend
```

## Prerequisites

- Node.js 20+ recommended
- npm

## Quick start

Install dependencies in both projects:

```bash
cd client
npm install

cd ../server
npm install
```

Run the backend (from server):

```bash
cd server
npx tsx index.ts
```

Run the frontend (from client) in a second terminal:

```bash
cd client
npm run dev
```

Server runs on port 3000 by default, configurable via `PORT`.

## Available scripts

### Client (`client/package.json`)

- `npm run dev` - start Vite dev server
- `npm run build` - type-check and build frontend
- `npm run lint` - run ESLint
- `npm run preview` - preview production client build

### Server (`server/package.json`)

- `npx tsx index.ts` - run the server in development

## How rooms work

- Joining a room registers the user in server memory.
- Every draw segment is broadcast to other users and stored per room.
- New users get stroke replay so they see existing drawing state.
- When users leave, presence updates are broadcast.
- Empty rooms are removed from memory.

## Network/events

Main Socket.IO events:

- Client -> Server: `join-room`, `on-draw`, `cursor-move`, `undo`
- Server -> Client: `room-users`, `draw-canvas`, `cursor-update`, `undo-canvas`

Game-related events include `start-game`, `correct-guess`, and `next-turn`.

NB: Each event is in order, so `join-room` reciprocates `room-users` and so forth.

## Production notes

The server serves static files from `client/dist`. Alter config if necessary.
To run as a single deployed app:

1. Build the client.
2. Start the server.

Example:

```bash
cd client
npm run build

cd ../server
npx tsx index.ts
```

The server listens on `PORT` or defaults to `3000`.

## Notes

- Server data is in-memory only (rooms/strokes are lost on restart).
- Client socket URL is currently hardcoded to `http://localhost:3000`.
- No auth or persistent storage in this release.
- No languages were harmed in the making of this app

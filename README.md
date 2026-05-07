# SeeSalt

SeeSalt is a real-time collaborative drawing app with room-based sessions.
Users can create or join a room, draw together on a shared canvas, see other users online, and receive live cursor updates.

## What it does

- Real-time collaborative drawing over WebSockets (Socket.IO)
- Room-based collaboration with auto-generated room codes
- Shared canvas state replay for newly joined users
- User presence list per room
- Live remote cursor positions
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

Server runs on port 3000 by default, can be exported to .env PORT variable.

## Available scripts

### Client (`client/package.json`)

- `npm run dev` - start Vite dev server
- `npm run build` - type-check and build frontend
- `npm run lint` - run ESLint
- `npm run preview` - preview production client build

### Server (`server/package.json`)

No development scripts are currently defined.
Use `npx tsx index.ts` to run the server in development.
Use `nodemon index.ts` for hot reloads (will need to install nodemon with `npm i -d nodemon`).

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

## Current limitations

- Server data is in-memory only (rooms/strokes are lost on restart).
- Client socket URL is currently hardcoded to `http://localhost:3000`.
- No auth, rate limiting, or persistent storage yet.

## Suggested next improvements

- Persist rooms/strokes in Redis or a database.
- Add support for touchscreens
- Integrate other use-cases (e.g. chat for virtual meetings, Pictionary-style interactivity)

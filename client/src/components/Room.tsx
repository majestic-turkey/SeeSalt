import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import useCanvas from "../hooks/useCanvas";
import Toolbar from "./Toolbar";
import Chat from "./Chat";
import type { User } from "../types";
import { colorFromId } from "../utils/canvasUtils";
import useGameTimer from "../hooks/useGameTimer";

export default function Room() {
    // Local state
    const [color, setColor] = useState("#212121");
    const [brushSize, setBrushSize] = useState(4);
    const [eraser, setEraser] = useState(false);
    const [cursors, setCursors] = useState<Record<string, { x: number; y: number; username: string }>>({});
    const [correctGuesser, setCorrectGuesser] = useState<string | null>(null);

    // Global state and utilities

    const { roomId } = useParams();
    const navigate = useNavigate();
    const { username, users, socket, currentDrawerId, isPlaying, currentWord } = useStore();
    const { canvasRef, saveAsPng, undo, clearStrokes } = useCanvas(color, brushSize, eraser, username);

    const isDrawer = currentDrawerId === socket?.id
    const { timeLeft, startTimer } = useGameTimer(() => {
        // Clear UI when timer completes
        setCursors({});
    });

    useEffect(() => {
        if (!roomId || !username || !socket) {
            navigate("/");
            return;
        }
        socket.emit("join-room", { roomId, username });
    }, [roomId, navigate, socket, username]);

    useEffect(() => {
        if (!socket) return;

        const handleCursorUpdate = (payload: { userId: string; x: number; y: number; username: string }) => {
            setCursors((prev) => ({ ...prev, [payload.userId]: payload }));
        }

        const handleNextTurn = () => {
            setCursors({});
            canvasRef.current?.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            clearStrokes();
            setCorrectGuesser(null);
        }

        const handleCorrectGuess = (payload: { username: string }) => {
            startTimer(15);
            setCorrectGuesser(payload.username);
        }

        // Handle cursor updates from other users
            socket.on('cursor-update', handleCursorUpdate);

        // Handle correct guess logic
        socket?.on('correct-guess', handleCorrectGuess);

        // Handle next turn logic
        socket?.on('next-turn', handleNextTurn);

        return () => {
            socket.off('cursor-update', handleCursorUpdate);
            socket.off('correct-guess', handleCorrectGuess);
            socket.off('next-turn', handleNextTurn);
        };
    }, [socket, canvasRef, startTimer, clearStrokes]);

    // Listen for users to leave the room and remove their cursors
    useEffect(() => {
        const handleRoomUsers = (updatedUsers: User[]) => {
            const updatedUserIds = updatedUsers.map(user => user.id);
            setCursors((prev) => {
                const updatedCursors: Record<string, { x: number; y: number; username: string }> = {};
                for (const userId of Object.keys(prev)) {
                    if (updatedUserIds.includes(userId)) {
                        updatedCursors[userId] = prev[userId];
                    }
                }
                return updatedCursors;
            });
        };

        socket?.on('room-users', handleRoomUsers);

        return () => {
            socket?.off('room-users', handleRoomUsers);
        };
    }, [socket]);

    return (<>
        <section className="room-layout">
            {/* Sidebar with user list */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-room-name">Room</div>
                    <div className="sidebar-room-id">{roomId}</div>
                </div>
                <div className="sidebar-section-label">Online · {users.length}</div>
                <ul className="user-list">
                    {users.map((user) => (
                        <li className="user-item" key={user.id}>
                            <div className="user-avatar" style={{ backgroundColor: colorFromId(user.id) }}>
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="user-name">{user.username}</span>
                            <span className="user-status-dot" />
                        </li>
                    ))}
                </ul>
            </aside>
            {/* Main canvas area */}
            <div className="canvas-area">
                <div className="canvas-topbar">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate("/")} title="Leave room">
                        ← Leave
                    </button>
                </div>
                <div className="canvas-scroll">
                    <div className="canvas-frame">
                        <canvas
                            ref={canvasRef}
                            width={800}
                            height={600}
                        />
                        <div className="cursors" style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none'
                        }}>
                            {Object.entries(cursors).map(([userId, cursor]) => (
                                <div key={userId} style={{
                                    position: 'absolute',
                                    left: cursor.x,
                                    top: cursor.y,
                                    transform: 'translate(-50%, -50%)'
                                }}>
                                    <div style={{
                                        width: '10px',
                                        height: '10px',
                                        backgroundColor: colorFromId(userId),
                                        borderRadius: '50%'
                                    }}>

                                    </div>
                                    <span style={{ color: 'black', textShadow: '1px 1px 1px white', fontSize: '12px' }}>{cursor.username}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {isPlaying && (
                    <div className="status-bar">
                        {timeLeft !== null
                            ? <p>{correctGuesser} guessed it! Next turn in {timeLeft}s — the word was "{currentWord}"</p>
                            : isDrawer
                                ? <p>Draw: <strong>{currentWord}</strong></p>
                                : <p>{users.find(u => u.id === currentDrawerId)?.username} is drawing — guess in chat!</p>
                        }
                    </div>
                )}
                {!isPlaying && (
                    <button onClick={() => {
                        socket?.emit('start-game')
                        console.log(`Emitted start-game event from client: ${socket?.id}`);
                    }
                }>Start Game</button>
                )}
                <Toolbar
                    color={color}
                    setColor={setColor}
                    brushSize={brushSize}
                    setBrushSize={setBrushSize}
                    eraser={eraser}
                    setEraser={setEraser}
                    saveAsPng={saveAsPng}
                    undo={undo}
                />
            </div>
            <div className="chat-sidebar">
                <div className="sidebar-section-label sidebar-chat-label">Chat</div>
                <Chat />
            </div>
        </section>
    </>);
}
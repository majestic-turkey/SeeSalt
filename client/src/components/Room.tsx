import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import useCanvas from "../hooks/useCanvas";
import Toolbar from "./Toolbar";
import Chat from "./Chat";
import type { User } from "../types";

function colorFromId(id: string): string {
    let hash = 0
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 70%, 60%)`
}


export default function Room() {
    // Local state
    const [color, setColor] = useState("#212121");
    const [brushSize, setBrushSize] = useState(4);
    const [eraser, setEraser] = useState(false);
    const [cursors, setCursors] = useState<Record<string, { x: number; y: number; username: string }>>({});

    const { roomId } = useParams();
    const navigate = useNavigate();
    const { username, users, socket } = useStore();
    const { canvasRef, saveAsPng, undo } = useCanvas(color, brushSize, eraser, username);

    useEffect(() => {
        if (!roomId || !username || !socket) {
            navigate("/");
            return;
        }
        socket.emit("join-room", { roomId, username });
    }, [roomId, navigate, socket, username]);

    useEffect(() => {
        if (!socket) return;
        socket.on('cursor-update', (payload) => {
            setCursors((prev) => ({ ...prev, [payload.userId]: payload }));
        });
        return () => {
            socket.off('cursor-update');
        };
    }, [socket]);

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
                            <div className="user-avatar">
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
                                <span style={{ color: 'white', fontSize: '12px' }}>{cursor.username}</span>
                            </div>
                        ))}
                    </div>
                </div>
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
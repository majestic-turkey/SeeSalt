import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import useCanvas from "../hooks/useCanvas";
import Toolbar from "./Toolbar";

export default function Room() {
    const [color, setColor] = useState("#212121");
    const [brushSize, setBrushSize] = useState(4);
    const [eraser, setEraser] = useState(false);

    const { roomId } = useParams();
    const navigate = useNavigate();
    const { username, users, socket } = useStore();
    const canvasRef = useCanvas(color, brushSize, eraser);

    useEffect(() => {
        if (!roomId || !username || !socket) {
            navigate("/");
            return;
        }
        socket.emit("join-room", { roomId, username });
    }, [roomId, navigate, socket, username]);

    return (
        <div className="room-layout">
            {/* ── Left sidebar: users ── */}
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

            {/* ── Main canvas area ── */}
            <main className="canvas-area">
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
                    </div>
                </div>

                <Toolbar
                    color={color}
                    setColor={setColor}
                    brushSize={brushSize}
                    setBrushSize={setBrushSize}
                    eraser={eraser}
                    setEraser={setEraser}
                />
            </main>
        </div>
    );
}
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useStore from "../store/useStore";
import useCanvas from "../hooks/useCanvas";

export default function Room() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { username, users, socket } = useStore();
    const canvasRef = useCanvas();

    useEffect(() => {
        if (!roomId || !username || !socket) {
            navigate("/");
            return;
        }
        socket.emit("join-room", { roomId, username });
    }, [roomId, navigate, socket, username]);

    return (<section className="room" style={{ display: 'flex', height: '100vh' }}>
        <div className="sidebar" style={{ width: '250px', padding: '20px', backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
            <h1>Room: {roomId}</h1>
            <h2>Users in room:</h2>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.username}</li>
                ))}
            </ul>
        </div>
        <div className="canvas-container" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                style={{ display: 'block' }}
            />
        </div>
    </section>);
}
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

    return (
        <div>
            <h1>Room: {roomId}</h1>
            <h2>Users in room:</h2>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.username}</li>
                ))}
            </ul>
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                style={{ display: 'block' }}
            />
        </div>
    );
}
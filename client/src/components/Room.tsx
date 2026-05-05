import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useStore from "../store/useStore";

export default function Room() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { username, users, socket } = useStore();

    useEffect(() => {
        if (!roomId || !username || !socket) {
            navigate("/");
            return;
        }
        socket.emit("join-room", {roomId, username});
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
        </div>
    );
}
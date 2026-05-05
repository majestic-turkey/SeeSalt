import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import useCanvas from "../hooks/useCanvas";

export default function Room() {
    // Local state
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

    return (<>
        <h1>Room: {roomId}</h1>
        <section className="room" style={{ display: 'flex', height: '100vh' }}>
            <div className="sidebar" style={{ width: '250px', padding: '20px', backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
                <h2>Users in room:</h2>
                <ul>
                    {users.map((user) => (
                        <li key={user.id}>{user.username}</li>
                    ))}
                </ul>
            </div>
            <div className="canvas-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    style={{ display: 'block', border: '1px solid black', backgroundColor: '#212121', borderRadius: '8px' }}
                />
                <div className="toolbar" style={{ display: 'flex', gap: '10px', justifyContent: 'space-around' }}>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                    <input type="range" min="1" max="20" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} />
                    <button onClick={() => setEraser(!eraser)} style={{ backgroundColor: eraser ? '#f44336' : '#4CAF50', color: 'white', border: 'none', padding: '10px', borderRadius: '4px' }}>
                        {eraser ? 'Eraser On' : 'Eraser Off'}
                    </button>
                </div>
            </div>
        </section>
    </>);
}
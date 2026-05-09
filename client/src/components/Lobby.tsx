import useStore from '../store/useStore';
import { type JSX, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Lobby(): JSX.Element {
    const [roomCode, setRoomCode] = useState('');
    const { socket, username, setUsername } = useStore();
    const navigate = useNavigate();

    function generateRandomRoomId() {
        return Math.random().toString(36).substring(2, 8);
    }

    const handleCreateRoom = () => {
        const randomRoomCode = generateRandomRoomId();

        if (!socket || !username) {
            alert('Please enter a username');
            return;
        }

        navigate(`/room/${randomRoomCode}`);
    }

    const handleJoinRoom = () => {
        if (!socket || !username || !roomCode) {
            alert('Please enter a username and room code');
            return;
        }

        navigate(`/room/${roomCode}`);
    };

    return (
        <div className="lobby">
            <div className="lobby-brand">
                <div className="lobby-logo">🎨</div>
                <h1 className="lobby-title">SeeSalt</h1>
            </div>
            <p className="lobby-subtitle">Real-time collaborative drawing</p>

            <div className="lobby-card">
                <div className="lobby-fields">
                    <div className="field">
                        <label htmlFor="username-input">Username</label>
                        <input
                            id="username-input"
                            type="text"
                            placeholder="Enter your name…"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="room-input">Room Code</label>
                        <input
                            id="room-input"
                            type="text"
                            pattern="[A-Za-z0-9]{6}"
                            placeholder="6-character code to join"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value)}
                        />
                    </div>
                </div>

                <hr className="lobby-divider" />

                <div className="lobby-actions">
                    <button className="btn btn-primary" onClick={handleCreateRoom}>
                        ✦ Create Room
                    </button>
                    <button className="btn btn-secondary" onClick={handleJoinRoom}>
                        → Join Room
                    </button>
                </div>
            </div>
        </div>
    )
}
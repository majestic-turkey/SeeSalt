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

    return (<>
        <h1>Lobby</h1>
        <label>Room name:
            <input type="text" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
        </label>
        <label>Username: 
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value.trim())} />
        </label>
        <button onClick={handleCreateRoom}>
            Create Room
        </button>
        <button onClick={handleJoinRoom}>
            Join Room
        </button>
    </>)
}
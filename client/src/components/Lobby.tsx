import useStore from '../store/useStore';
import { type JSX, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Lobby(): JSX.Element {
    const [roomCode, setRoomCode] = useState('');
    const { socket, username } = useStore();
    const navigate = useNavigate();

    function generateRandomRoomId() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    function getUsername() {
        const usernameInput = document.getElementById('username') as HTMLInputElement;
        return usernameInput.value.trim();
    }

    const handleCreateRoom = () => {
        const randomRoomCode = generateRandomRoomId();
        const username = getUsername();

        if (!socket || !username) {
            alert('Please enter a username');
            return;
        }
        
        setRoomCode(randomRoomCode);
        socket?.emit('join-room', { roomId: randomRoomCode, username });
        navigate(`/room/${randomRoomCode}`);
    }

    const handleJoinRoom = () => {
        const username = getUsername();

        if (!socket || !username || !roomCode) {
            alert('Please enter a username and room code');
            return;
        }
        socket.emit('join-room', { roomId: roomCode, username });
        navigate(`/room/${roomCode}`);
    };

    return (<>
        <h1>Lobby</h1>
        <label>Room name:
            <input type="text" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
        </label>
        <label>Username: 
            <input type="text" placeholder={username} id="username" />
        </label>
        <button onClick={handleCreateRoom}>
            Create Room
        </button>
        <button onClick={handleJoinRoom}>
            Join Room
        </button>
    </>)
}
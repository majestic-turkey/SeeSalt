import { type JSX, useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import type { ChatMessage } from '../types';

export default function Chat(): JSX.Element {
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const { socket } = useStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!socket) return;

        const handleChatMessage = (data: ChatMessage | ChatMessage[]) => {
            if (Array.isArray(data)) {
                setChatMessages(data);
                return;
            }
            setChatMessages((prev) => [...prev, data]);
        };

        socket.on('chat-message', handleChatMessage);
        socket.emit('get-chat-history');

        return () => {
            socket.off('chat-message', handleChatMessage);
        };
    }, [socket]);

    // Scroll to the latest message whenever the list changes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    function sendChat() {
        const message = chatInput.trim();
        if (!message || !socket) return;
        socket.emit('send-chat-message', message);
        setChatInput('');
    }

    return (
        <div className="chat-panel">
            <div className="chat-messages">
                {chatMessages.map((msg, index) => (
                    <p key={index} className="chat-message">
                        <strong className="chat-username">{msg.username}:</strong> {msg.message}
                    </p>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form
                className="chat-form"
                onSubmit={(e) => { e.preventDefault(); sendChat(); }}
            >
                <input
                    className="chat-input"
                    type="text"
                    placeholder="Say something…"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                />
                <button className="btn btn-primary chat-send" type="submit">Send</button>
            </form>
        </div>
    );
}

import { User } from './types';
import words from './words.json';

interface GameState {
    isPlaying: boolean;
    currentDrawerId: string | null;
    currentWord: string | null;
    drawerIndex: number;
    correctGuessTimeout: ReturnType<typeof setTimeout> | null;
}

const gameStates: Record<string, GameState> = {};

function getRandomWord(): string {
    return words[Math.floor(Math.random() * words.length)];
}

export function startGame(roomId: string, users: User[]): GameState {
    const firstDrawer = users[0];
    const word = getRandomWord();

    // Initialize game state
    const gameState: GameState = {
        isPlaying: true,
        currentDrawerId: firstDrawer.id,
        currentWord: word,
        drawerIndex: 0,
        correctGuessTimeout: null,
    };

    gameStates[roomId] = gameState;
    return gameState;
}

export function nextDrawer(roomId: string, users: User[]): GameState {
    const gameState = gameStates[roomId];
    if (!gameState) {
        throw new Error('Game not found');
    }

    gameState.drawerIndex = (gameState.drawerIndex + 1) % users.length;
    gameState.currentDrawerId = users[gameState.drawerIndex].id;

    gameState.currentWord = getRandomWord();

    if (gameState.correctGuessTimeout) {
        clearTimeout(gameState.correctGuessTimeout);
    }
    gameState.correctGuessTimeout = null;

    gameStates[roomId] = gameState;

    return gameState;
}

export function handleCorrectGuess(roomId: string, users: User[], onTimeout: () => void): GameState {
    const gameState = gameStates[roomId];
    if (!gameState) {
        throw new Error('Game not found');
    }

    gameState.correctGuessTimeout = setTimeout(() => {
        nextDrawer(roomId, users);
        onTimeout();
    }, 15000);

    return gameState;
}
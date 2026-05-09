import type { StrokeSegment } from '../types';
import useStore from '../store/useStore';
import { useEffect, useCallback } from 'react';
import { drawSegment } from '../utils/canvasUtils';

export default function useDrawSync(
    allStrokes: React.RefObject<StrokeSegment[]>,
    canvasRef: React.RefObject<HTMLCanvasElement | null>
): { emitDraw: (segment: StrokeSegment) => void, emitUndo: (strokeId: string) => void } {
    const { socket } = useStore();

    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        const handleDraw = (segment: StrokeSegment) => {
            allStrokes.current.push(segment);
            drawSegment(ctx, segment);
        };

        const handleUndo = (payload: { strokeId: string; userId: string }) => {
            const filtered = allStrokes.current.filter(s => s.strokeId !== payload.strokeId)
            allStrokes.current.splice(0, allStrokes.current.length, ...filtered)
            ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            allStrokes.current.forEach(segment => drawSegment(ctx, segment));
        };

        socket?.on('draw-canvas', handleDraw);
        socket?.on('undo-canvas', handleUndo);

        return () => {
            socket?.off('draw-canvas', handleDraw);
            socket?.off('undo-canvas', handleUndo);
        }
    }, [socket, canvasRef, allStrokes]);

    const emitDraw = useCallback((segment: StrokeSegment) => {
        allStrokes.current.push(segment)
        socket?.emit('on-draw', segment)
    }, [socket, allStrokes]);

    const emitUndo = useCallback((strokeId: string) => {
        socket?.emit('undo', { strokeId, userId: socket?.id || '' })
    }, [socket]);

    return { emitDraw, emitUndo }
}
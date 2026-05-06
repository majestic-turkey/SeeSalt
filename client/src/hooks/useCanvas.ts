import { useRef, useEffect } from 'react';
import useStore from '../store/useStore';
import type { StrokeSegment } from '../types';

export default function useCanvas(color: string, brushSize: number, eraser: boolean): React.RefObject<HTMLCanvasElement> {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isMouseDown = useRef(false);
    const mousePosition = useRef<{ x: number; y: number } | null>(null);
    const { socket, username } = useStore();
    const colorRef = useRef(color);
    const brushSizeRef = useRef(brushSize);
    const eraserRef = useRef(eraser);

    useEffect(() => {
        colorRef.current = color;
        brushSizeRef.current = brushSize;
        eraserRef.current = eraser;
    }, [color, brushSize, eraser]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        function drawSegment(
            ctx: CanvasRenderingContext2D,
            segment: StrokeSegment
        ) {
            ctx.beginPath()
            ctx.moveTo(segment.x0, segment.y0)
            ctx.lineTo(segment.x1, segment.y1)
            ctx.strokeStyle = segment.color
            ctx.lineWidth = segment.width
            ctx.lineCap = 'round'
            ctx.stroke()
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (!isMouseDown.current || !mousePosition.current) return;

            const rect = canvas.getBoundingClientRect();

            // Begin drawing the line
            const newMousePosition = { x: e.clientX - rect.left, y: e.clientY - rect.top };

            // Draw the segment locally
            const segment: StrokeSegment = {
                x0: mousePosition.current!.x,
                y0: mousePosition.current!.y,
                x1: newMousePosition.x,
                y1: newMousePosition.y,
                color: eraserRef.current ? '#212121' : colorRef.current,
                width: brushSizeRef.current,
            };
            drawSegment(ctx, segment);
            socket?.emit('on-draw', segment); // Emit the segment to the server
            socket?.emit('cursor-move', { x: e.clientX, y: e.clientY, username, userId: socket.id || '' }); // Emit cursor position to the server
            mousePosition.current = newMousePosition;
        };

        const handleMouseDown = (e: MouseEvent) => {

            const rect = canvas.getBoundingClientRect();
            mousePosition.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            isMouseDown.current = true;
        };

        const handleMouseUpOrLeave = () => {
            isMouseDown.current = false;
            mousePosition.current = null;
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUpOrLeave);
        canvas.addEventListener('mouseleave', handleMouseUpOrLeave);

        // Listen for 'draw-canvas' events from the server
        socket?.on('draw-canvas', (segment: StrokeSegment) => {
            drawSegment(ctx, segment);
        });

        // Listen for 'cursor-update' events from the server
        socket?.on('cursor-update', (payload: { x: number; y: number; username: string; userId: string }) => {
            console.log(`Cursor update from ${payload.username} (ID: ${payload.userId}): (${payload.x}, ${payload.y})`);
            ctx.ellipse(payload.x, payload.y, 5, 5, 0, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
        });

        // Cleanup event listeners and socket listeners on unmount
        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUpOrLeave);
            canvas.removeEventListener('mouseleave', handleMouseUpOrLeave);
            socket?.off('draw-canvas');
            socket?.off('cursor-update');
        };

    }, [socket, username]);

    return canvasRef as React.RefObject<HTMLCanvasElement>;
}
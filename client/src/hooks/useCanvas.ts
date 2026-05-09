import { useRef, useEffect } from 'react';
import useStore from '../store/useStore';
import type { StrokeSegment } from '../types';

export default function useCanvas(color: string, brushSize: number, eraser: boolean, username: string): { canvasRef: React.RefObject<HTMLCanvasElement>, saveAsPng: () => void, undo: () => void } {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isMouseDown = useRef(false);
    const mousePosition = useRef<{ x: number; y: number } | null>(null);
    const { socket } = useStore();
    const usernameRef = useRef(username);
    const colorRef = useRef(color);
    const brushSizeRef = useRef(brushSize);
    const eraserRef = useRef(eraser);
    const allStrokes = useRef<StrokeSegment[]>([]);
    const currentStrokeId = useRef<string | null>(null);

    useEffect(() => {
        colorRef.current = color;
        brushSizeRef.current = brushSize;
        eraserRef.current = eraser;
        usernameRef.current = username;
    }, [color, brushSize, eraser, username]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        function getCanvasCoords(clientX: number, clientY: number) {
            if (!canvas) return { x: 0, y: 0 };
            const rect = canvas.getBoundingClientRect();
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        function handleDraw(newMousePosition: { x: number; y: number }) {
            if (!mousePosition.current || !isMouseDown.current || !ctx) return;

            const segment: StrokeSegment = {
                x0: mousePosition.current.x,
                y0: mousePosition.current.y,
                x1: newMousePosition.x,
                y1: newMousePosition.y,
                color: eraserRef.current ? '#f8f9fa' : colorRef.current,
                width: brushSizeRef.current,
                userId: socket?.id || '',
                strokeId: currentStrokeId.current!
            };

            drawSegment(ctx, segment);
            socket?.emit('on-draw', segment);
            allStrokes.current.push(segment);
            socket?.emit('cursor-move', { x: newMousePosition.x, y: newMousePosition.y, username: usernameRef.current, userId: socket.id || '' });
            mousePosition.current = newMousePosition;
        }

        function handleDrawStart(clientX: number, clientY: number) {
            currentStrokeId.current = crypto.randomUUID();
            mousePosition.current = getCanvasCoords(clientX, clientY);
            isMouseDown.current = true;
        }

        // Touchscreen event handlers
        const handleTouchStart = (e: TouchEvent) => {
            e.preventDefault();
            handleDrawStart(e.touches[0].clientX, e.touches[0].clientY);
        };

        const handleTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            handleDraw(getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY));
        };

        const handleTouchEnd = () => {
            currentStrokeId.current = null;
            isMouseDown.current = false;
            mousePosition.current = null;
        };

        // Mouse event handlers
        const handleMouseMove = (e: MouseEvent) => {
            handleDraw(getCanvasCoords(e.clientX, e.clientY));
        };

        const handleMouseDown = (e: MouseEvent) => {
            handleDrawStart(e.clientX, e.clientY);
        };

        const handleMouseUpOrLeave = () => {
            currentStrokeId.current = null;
            isMouseDown.current = false;
            mousePosition.current = null;
        };

        // Add touch event listeners
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd);
        canvas.addEventListener('touchcancel', handleTouchEnd);

        // Add mouse event listeners
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUpOrLeave);
        canvas.addEventListener('mouseleave', handleMouseUpOrLeave);

        // Listen for 'draw-canvas' events from the server
        socket?.on('draw-canvas', (segment: StrokeSegment) => {
            allStrokes.current.push(segment);
            drawSegment(ctx, segment);
        });

        // Listen for 'undo-canvas' events from the server
        socket?.on('undo-canvas', (payload: { strokeId: string; userId: string }) => {
            allStrokes.current = allStrokes.current.filter(segment => segment.strokeId !== payload.strokeId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            allStrokes.current.forEach(segment => drawSegment(ctx, segment));
        });

        // Cleanup event listeners and socket listeners on unmount
        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUpOrLeave);
            canvas.removeEventListener('mouseleave', handleMouseUpOrLeave);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
            canvas.removeEventListener('touchcancel', handleTouchEnd);
            socket?.off('draw-canvas');
            socket?.off('undo-canvas');
        };

    }, [socket]);

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

    const saveAsPng = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `seesalt_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const undo = () => {
        const lastStroke = allStrokes.current.findLast(s => s.userId === socket?.id)
        if (!lastStroke || !socket?.id) return
        const strokeId = lastStroke.strokeId

        if (allStrokes.current.length === 0) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        allStrokes.current = allStrokes.current.filter(s => s.strokeId !== strokeId)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        allStrokes.current.forEach(s => drawSegment(ctx, s))
        socket?.emit('undo', { strokeId, userId: socket.id })
    }

    return { canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>, saveAsPng, undo };
}
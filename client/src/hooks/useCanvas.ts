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

        
        const handleMouseMove = (e: MouseEvent) => {
            if (!isMouseDown.current || !mousePosition.current) return;
            
            const rect = canvas.getBoundingClientRect();
            const calculatedX = e.clientX - rect.left;
            const calculatedY = e.clientY - rect.top;

            // Begin drawing the line
            const newMousePosition = { x: calculatedX, y: calculatedY };

            // Draw the segment locally
            const segment: StrokeSegment = {
                x0: mousePosition.current!.x,
                y0: mousePosition.current!.y,
                x1: newMousePosition.x,
                y1: newMousePosition.y,
                color: eraserRef.current ? '#212121' : colorRef.current,
                width: brushSizeRef.current,
                userId: socket?.id || '',
                strokeId: Math.floor(Math.random() * 9000) + 1000 // Generate a random stroke ID
            };
            drawSegment(ctx, segment);
            socket?.emit('on-draw', segment); // Emit the segment to the server
            allStrokes.current.push(segment);
            socket?.emit('cursor-move', { x: calculatedX, y: calculatedY, username: usernameRef.current, userId: socket.id || '' }); // Emit cursor position to the server
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
            allStrokes.current.push(segment);
            drawSegment(ctx, segment);
        });

        // Listen for 'undo-canvas' events from the server
            socket?.on('undo-canvas', (payload: { strokeId: number; userId: string }) => {
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
        if (allStrokes.current.length === 0) return;
        let lastSegmentIndex;
        const lastIndex = allStrokes.current.findLastIndex(segment => segment.userId === socket?.id);
        if (lastIndex !== -1) {
            lastSegmentIndex = allStrokes.current[lastIndex];
            allStrokes.current.splice(lastIndex, 1);;
        }
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        allStrokes.current.forEach(segment => drawSegment(ctx, segment));
        if (!lastSegmentIndex || !socket?.id) return;
        socket?.emit('undo', { strokeId: lastSegmentIndex?.strokeId, userId: socket.id });
    }
    
    return { canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>, saveAsPng, undo };
}
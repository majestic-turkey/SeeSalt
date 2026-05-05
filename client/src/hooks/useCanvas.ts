import { useRef, useEffect } from 'react';
import type { StrokeSegment } from '../types';

export default function useCanvas(): React.RefObject<HTMLCanvasElement> {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isMouseDown = useRef(false);
    const mousePosition = useRef<{ x: number; y: number } | null>(null);

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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!isMouseDown.current || !mousePosition.current) return;

            // Begin drawing the line
            const newMousePosition = { x: e.clientX, y: e.clientY };

            // Draw the segment locally
            const segment: StrokeSegment = {
                x0: mousePosition.current!.x,
                y0: mousePosition.current!.y,
                x1: newMousePosition.x,
                y1: newMousePosition.y,
                color: 'black',
                width: 2
            };
            drawSegment(ctx, segment);
            mousePosition.current = newMousePosition;
        };

        const handleMouseDown = (e: MouseEvent) => {
            mousePosition.current = { x: e.clientX, y: e.clientY };
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

        // Cleanup event listeners on unmount
        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUpOrLeave);
            canvas.removeEventListener('mouseleave', handleMouseUpOrLeave);
        };

    }, []);

    return canvasRef as React.RefObject<HTMLCanvasElement>;
}
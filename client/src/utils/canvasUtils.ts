import { type StrokeSegment } from '../types'

export function drawSegment(
    ctx: CanvasRenderingContext2D,
    segment: StrokeSegment
): void {
    ctx.beginPath()
    ctx.moveTo(segment.x0, segment.y0)
    ctx.lineTo(segment.x1, segment.y1)
    ctx.strokeStyle = segment.color
    ctx.lineWidth = segment.width
    ctx.lineCap = 'round'
    ctx.stroke()
}
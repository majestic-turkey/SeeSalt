interface ToolbarProps {
    color: string;
    setColor: (color: string) => void;
    brushSize: number;
    setBrushSize: (size: number) => void;
    eraser: boolean;
    setEraser: (eraser: boolean) => void;
}

const MIN_DOT_SIZE = 4;
const DOT_SCALE_FACTOR = 1.5;
const MAX_DOT_SIZE = 22;

export default function Toolbar({ color, setColor, brushSize, setBrushSize, eraser, setEraser }: ToolbarProps) {
    const dotSize = Math.max(MIN_DOT_SIZE, Math.min(brushSize * DOT_SCALE_FACTOR, MAX_DOT_SIZE));

    return (
        <div className="toolbar">
            {/* Color picker */}
            <div className="toolbar-group">
                <span className="toolbar-label">Color</span>
                <div className="color-swatch-wrapper" title="Pick color">
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                    />
                </div>
            </div>

            <div className="toolbar-divider" />

            {/* Brush size */}
            <div className="toolbar-group brush-range-wrapper">
                <span className="toolbar-label">Size</span>
                <div className="brush-size-preview">
                    <div style={{
                        width: `${dotSize}px`,
                        height: `${dotSize}px`,
                        borderRadius: '50%',
                        background: eraser ? 'var(--border)' : color,
                        border: eraser ? '1px solid var(--text-muted)' : 'none',
                        transition: 'width .1s, height .1s',
                    }} />
                </div>
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                />
                <span className="size-badge">{brushSize}px</span>
            </div>

            <div className="toolbar-divider" />

            {/* Eraser toggle */}
            <div className="toolbar-group">
                <button
                    className={`btn btn-ghost eraser-btn${eraser ? ' active' : ''}`}
                    onClick={() => setEraser(!eraser)}
                    title={eraser ? 'Switch to brush' : 'Switch to eraser'}
                >
                    {eraser ? '✦ Eraser' : '✎ Brush'}
                </button>
            </div>
        </div>
    )
}
interface ToolbarProps {
    color: string;
    setColor: (color: string) => void;
    brushSize: number;
    setBrushSize: (size: number) => void;
    eraser: boolean;
    setEraser: (eraser: boolean) => void;
    saveAsPng: () => void;
    undo: () => void;
}

export default function Toolbar({ color, setColor, brushSize, setBrushSize, eraser, setEraser, saveAsPng, undo }: ToolbarProps) {
    return (
        <div className="toolbar" style={{ display: 'flex', gap: '10px', justifyContent: 'space-around' }}>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            <input type="range" min="1" max="20" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} />
            <button onClick={() => setEraser(!eraser)} style={{ backgroundColor: eraser ? '#f44336' : '#4CAF50', color: 'white', border: 'none', padding: '10px', borderRadius: '4px' }}>
                {eraser ? 'Eraser On' : 'Eraser Off'}
            </button>
            <button onClick={saveAsPng} style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px', borderRadius: '4px' }}>
                Save as PNG
            </button>
            <button onClick={undo} style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px', borderRadius: '4px' }}>
                Undo
            </button>
        </div>
    )
}
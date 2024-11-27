import React, { useRef, useEffect } from 'react';
import { useDrawing } from '../hooks/useDrawing';
import { Download, Eraser, Undo2, X } from 'lucide-react';

export const DrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    undo,
    downloadImage,
    setIsEraser,
    isEraser
  } = useDrawing(canvasRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to match container
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = 2;
    }
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto p-4">
      <div className="w-full bg-white rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Drawing Pad</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEraser(!isEraser)}
              className={`p-2 rounded ${
                isEraser ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              } hover:bg-blue-200 transition-colors`}
              title={isEraser ? 'Switch to Pen' : 'Switch to Eraser'}
            >
              <Eraser size={20} />
            </button>
            <button
              onClick={undo}
              className="p-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Undo"
            >
              <Undo2 size={20} />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Clear"
            >
              <X size={20} />
            </button>
            <button
              onClick={downloadImage}
              className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              title="Download"
            >
              <Download size={20} />
            </button>
          </div>
        </div>
        
        <div className="relative w-full" style={{ height: '400px' }}>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="absolute top-0 left-0 w-full h-full border-2 border-gray-200 rounded-lg cursor-crosshair bg-white"
          />
        </div>
      </div>
    </div>
  );
};
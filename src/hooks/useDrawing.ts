import { useRef, useState, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

export const useDrawing = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const lastPoint = useRef<Point | null>(null);
  const history = useRef<ImageData[]>([]);
  const historyStep = useRef(-1);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    historyStep.current++;
    if (historyStep.current < history.current.length) {
      history.current = history.current.slice(0, historyStep.current);
    }
    
    history.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  }, []);

  const getCoordinates = (event: MouseEvent | TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (event instanceof MouseEvent) {
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      };
    } else {
      const touch = event.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const point = getCoordinates(event.nativeEvent);
    if (!point) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    lastPoint.current = point;
    
    ctx.strokeStyle = isEraser ? '#FFFFFF' : '#000000';
    ctx.lineWidth = isEraser ? 20 : 2;
    saveState();
  }, [isEraser, saveState]);

  const draw = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (!isDrawing) return;

    const point = getCoordinates(event.nativeEvent);
    if (!point || !lastPoint.current) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    lastPoint.current = point;
  }, [isDrawing]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPoint.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
  }, [saveState]);

  const undo = useCallback(() => {
    if (historyStep.current <= 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    historyStep.current--;
    const imageData = history.current[historyStep.current];
    if (imageData) {
      ctx.putImageData(imageData, 0, 0);
    }
  }, []);

  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = dataUrl;
    link.click();
  }, []);

  return {
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    undo,
    downloadImage,
    isEraser,
    setIsEraser
  };
};
import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, X, RotateCcw, Loader2 } from 'lucide-react';
import { useEditorStore } from '../state/editorStore.ts';
import { inpaintImage } from '../ml/inpainting.ts';

interface EraserOverlayProps {
  width: number;
  height: number;
  scale: number;
  onClose: () => void;
}

export const EraserOverlay: React.FC<EraserOverlayProps> = ({
  width,
  height,
  scale,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [isInpainting, setIsInpainting] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);

  const { layers, activeLayerId, updateLayer, recordSnapshot } = useEditorStore();
  const activeLayer = layers.find((l) => l.id === activeLayerId) || layers[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
  }, [width, height]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    setIsDrawing(true);
    setHasStrokes(true);

    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.65)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    setHasStrokes(false);
  };

  const handleApplyInpaint = async () => {
    if (!canvasRef.current || !activeLayer?.src) return;
    setIsInpainting(true);

    try {
      // 1. Load active layer image (handle blob URLs without CORS restrictions)
      const img = new Image();
      if (!activeLayer.src!.startsWith('blob:')) {
        img.crossOrigin = 'anonymous';
      }
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load layer image for inpainting'));
        img.src = activeLayer.src!;
      });

      // 2. Run boundary-aware inpainting with layer transform mapping
      recordSnapshot();
      const result = await inpaintImage(img, canvasRef.current, {
        x: activeLayer.x,
        y: activeLayer.y,
        width: activeLayer.width,
        height: activeLayer.height,
        scaleX: activeLayer.scaleX,
        scaleY: activeLayer.scaleY,
        rotation: activeLayer.rotation,
      });

      // 3. Update layer with inpainted image
      updateLayer(activeLayer.id, {
        src: result.url,
      });

      onClose();
    } catch (err) {
      console.error('Magic Eraser error:', err);
    } finally {
      setIsInpainting(false);
    }
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-auto">
      {/* Brush Paint Canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          width: width * scale,
          height: height * scale,
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="cursor-crosshair absolute inset-0"
      />

      {/* Floating Magic Eraser Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-panel/95 backdrop-blur-md border border-borderDark rounded-2xl p-3 shadow-2xl flex items-center gap-4 z-40 text-xs text-zinc-900 dark:text-zinc-200">
        <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-300 font-semibold pl-2">
          <Eraser className="w-4 h-4 text-brand-500" />
          <span>Magic Eraser</span>
        </div>

        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700" />

        {/* Brush Size Slider */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-600 dark:text-zinc-400">Size</span>
          <input
            type="range"
            min="10"
            max="100"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24 accent-brand-500 bg-zinc-200 dark:bg-zinc-700"
          />
          <span className="font-mono text-zinc-700 dark:text-zinc-300 w-6">{brushSize}</span>
        </div>

        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700" />

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={clearCanvas}
            disabled={!hasStrokes || isInpainting}
            title="Clear brush strokes"
            className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            disabled={isInpainting}
            className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors flex items-center gap-1 border border-zinc-200 dark:border-zinc-700/60"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>

          <button
            onClick={handleApplyInpaint}
            disabled={!hasStrokes || isInpainting}
            className="px-4 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-black font-semibold transition-all shadow-md flex items-center gap-1.5"
          >
            {isInpainting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Erasing...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Erase Object</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

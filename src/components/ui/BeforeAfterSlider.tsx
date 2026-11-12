import React, { useState, useRef, useCallback } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  aspectRatio?: string; // e.g. '1/1', '16/9', '4/3'
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Original',
  afterLabel = 'AI Cutout',
  className = '',
  aspectRatio = '4/3',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clamped = Math.max(0, Math.min(rect.width, x));
    const percent = (clamped / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const onMouseDown = () => setIsDragging(true);
  const onMouseUp = () => setIsDragging(false);

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
      onTouchEnd={onMouseUp}
      className={`relative select-none overflow-hidden rounded-2xl border border-borderDark shadow-xl bg-stage cursor-ew-resize ${className}`}
      style={{ aspectRatio }}
    >
      {/* "After" Image (Full background) */}
      <img
        src={afterSrc}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        draggable={false}
      />
      <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider z-10">
        {afterLabel}
      </div>

      {/* "Before" Image (Clipped by slider position) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{
            width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
            maxWidth: 'none',
          }}
          draggable={false}
        />
        <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider z-10">
          {beforeLabel}
        </div>
      </div>

      {/* Draggable Divider Line & Handle */}
      <div
        className="absolute top-0 bottom-0 z-20 pointer-events-none"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-0.5 h-full bg-white shadow-[0_0_8px_rgba(0,0,0,0.6)]" />
        <button
          onMouseDown={onMouseDown}
          onTouchStart={onMouseDown}
          aria-label="Drag to compare before and after"
          className="pointer-events-auto absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-9 h-9 rounded-full bg-brand-500 text-black shadow-2xl flex items-center justify-center cursor-ew-resize hover:scale-110 active:scale-95 transition-transform"
        >
          <MoveHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

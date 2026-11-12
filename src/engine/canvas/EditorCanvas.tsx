import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Stage, Layer as KonvaLayer } from 'react-konva';
import Konva from 'konva';
import { useEditorStore } from '../state/editorStore.ts';
import { CanvasBackground } from './CanvasBackground.tsx';
import { CanvasLayer } from './CanvasLayer.tsx';
import { useStageZoom } from './useStageZoom.ts';
import { CanvasDimensions } from '../state/types.ts';
import { EraserOverlay } from './EraserOverlay.tsx';
import { GuideOverlay } from './GuideOverlay.tsx';
import { BeforeAfterSlider } from '../../components/ui/BeforeAfterSlider.tsx';

interface EditorCanvasProps {
  stageRef?: React.RefObject<Konva.Stage | null>;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({ stageRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const localStageRef = useRef<Konva.Stage | null>(null);
  const activeStageRef = stageRef || localStageRef;

  const {
    layers,
    activeLayerId,
    setActiveLayerId,
    backgroundFill,
    aspectRatio,
    setCanvasDimensions,
    setContainerDimensions,
    zoom,
    setZoom,
    editorMode,
    setEditorMode,
    guideOverlay,
    customDimensions,
    originalImageSrc,
    showBeforeAfter,
    setShowBeforeAfter,
  } = useEditorStore();

  const [compareAfterSrc, setCompareAfterSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!showBeforeAfter) {
      setCompareAfterSrc(null);
      return;
    }
    const stage = activeStageRef.current;
    if (!stage) return;
    const transformers = stage.find('Transformer');
    transformers.forEach((tr) => tr.hide());
    const prevScaleX = stage.scaleX();
    const prevScaleY = stage.scaleY();
    const prevX = stage.x();
    const prevY = stage.y();
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    stage.batchDraw();
    try {
      setCompareAfterSrc(stage.toDataURL({ pixelRatio: 1 }));
    } catch {
      setCompareAfterSrc(null);
    } finally {
      stage.scale({ x: prevScaleX, y: prevScaleY });
      stage.position({ x: prevX, y: prevY });
      transformers.forEach((tr) => tr.show());
      stage.batchDraw();
    }
  }, [showBeforeAfter, activeStageRef, layers, backgroundFill]);

  const { resetToFit } = useStageZoom();
  const [initialFitDone, setInitialFitDone] = useState(false);

  // Compute stage dimensions based on selected aspect ratio or custom tool presets
  const activeDimensions = useMemo<CanvasDimensions>(() => {
    if (customDimensions) {
      return customDimensions;
    }

    const primaryLayer = layers[0];
    const baseW = primaryLayer?.originalWidth || 1080;
    const baseH = primaryLayer?.originalHeight || 1080;

    switch (aspectRatio) {
      case '1:1':
        return { width: 1080, height: 1080 };
      case '4:5':
        return { width: 1080, height: 1350 };
      case '9:16':
        return { width: 1080, height: 1920 };
      case '16:9':
        return { width: 1920, height: 1080 };
      case '3:4':
        return { width: 1080, height: 1440 };
      case '4:3':
        return { width: 1440, height: 1080 };
      case 'original':
      default:
        return { width: baseW, height: baseH };
    }
  }, [aspectRatio, layers]);

  // Sync canvas dimensions to store
  useEffect(() => {
    setCanvasDimensions(activeDimensions);
  }, [activeDimensions, setCanvasDimensions]);

  // Track container dimensions with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setContainerDimensions({ width, height });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [setContainerDimensions]);

  // Auto-fit on initial image load
  useEffect(() => {
    if (layers.length > 0 && !initialFitDone) {
      // Small timeout to allow container bounds to settle
      const timer = setTimeout(() => {
        resetToFit();
        setInitialFitDone(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [layers.length, initialFitDone, resetToFit]);

  // Mouse wheel zoom interceptor (Cmd / Ctrl + wheel)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY;
        const currentZoom = useEditorStore.getState().zoom;
        const zoomDelta = delta < 0 ? 10 : -10;
        setZoom(currentZoom + zoomDelta);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [setZoom]);

  const scale = zoom / 100;
  const stageDisplayWidth = activeDimensions.width * scale;
  const stageDisplayHeight = activeDimensions.height * scale;

  return (
    <div
      ref={containerRef}
      className="relative flex-1 w-full h-full overflow-hidden bg-stage flex items-center justify-center p-2 sm:p-4 md:p-8 select-none z-0 touch-none"
      onClick={(e) => {
        // Deselect if clicking the dark outer stage
        if (e.target === containerRef.current) {
          setActiveLayerId(null);
        }
      }}
    >
      {/* Centered Artboard Viewport */}
      <div
        className="relative transition-shadow duration-300 shadow-2xl rounded-sm overflow-hidden"
        style={{
          width: stageDisplayWidth,
          height: stageDisplayHeight,
          touchAction: 'none',
        }}
      >
        {/* CSS Checkerboard backdrop for transparent mode */}
        {backgroundFill.type === 'transparent' && (
          <div className="absolute inset-0 checkerboard-pattern" />
        )}

        {/* Konva Root Canvas */}
        <Stage
          ref={(node) => {
            if (activeStageRef && 'current' in activeStageRef) {
              (activeStageRef as React.MutableRefObject<Konva.Stage | null>).current = node;
            }
          }}
          width={activeDimensions.width}
          height={activeDimensions.height}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={(e) => {
            // Deselect if clicking empty canvas background
            if (e.target === e.target.getStage()) {
              setActiveLayerId(null);
            }
          }}
        >
          <KonvaLayer>
            {/* Background fill */}
            <CanvasBackground fill={backgroundFill} dimensions={activeDimensions} />

            {/* Layer Nodes */}
            {layers.map((layer) => (
              <CanvasLayer
                key={layer.id}
                layer={layer}
                isSelected={layer.id === activeLayerId}
                onSelect={() => setActiveLayerId(layer.id)}
              />
            ))}
          </KonvaLayer>
        </Stage>

        {/* Interactive Eraser Brush Overlay */}
        {editorMode === 'eraser' && (
          <EraserOverlay
            width={activeDimensions.width}
            height={activeDimensions.height}
            scale={scale}
            onClose={() => setEditorMode('select')}
          />
        )}

        {/* Visual Alignment Guides (PAN Card Face, Signature, Passport, Amazon 85%, PFP) */}
        {guideOverlay !== 'none' && !showBeforeAfter && (
          <GuideOverlay
            type={guideOverlay}
            width={stageDisplayWidth}
            height={stageDisplayHeight}
          />
        )}

        {/* Before / After Split Comparison Overlay */}
        {showBeforeAfter && originalImageSrc && compareAfterSrc && (
          <div className="absolute inset-0 z-40 bg-stage/95 flex flex-col items-center justify-center">
            <BeforeAfterSlider
              beforeSrc={originalImageSrc}
              afterSrc={compareAfterSrc}
              beforeLabel="Original"
              afterLabel="Processed"
              className="w-full h-full rounded-sm"
              aspectRatio={`${activeDimensions.width}/${activeDimensions.height}`}
            />
            <button
              type="button"
              onClick={() => setShowBeforeAfter(false)}
              className="absolute bottom-3 right-3 z-50 min-h-[44px] px-4 py-2 rounded-full bg-zinc-900/90 hover:bg-black text-white text-xs font-bold shadow-lg border border-zinc-700"
            >
              Exit Compare
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

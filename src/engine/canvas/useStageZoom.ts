import { useCallback, useEffect } from 'react';
import { useEditorStore } from '../state/editorStore.ts';

export interface UseStageZoomOptions {
  padding?: { x: number; y: number };
  minScale?: number;
  maxScale?: number;
}

export function useStageZoom(options: UseStageZoomOptions = {}) {
  const { padding = { x: 48, y: 48 }, minScale = 0.1, maxScale = 5.0 } = options;

  const {
    zoom,
    setZoom,
    canvasDimensions,
    containerDimensions,
  } = useEditorStore();

  // Calculate the scale needed to fit the canvas snugly within the container
  const calculateFitScale = useCallback(() => {
    const availableWidth = Math.max(containerDimensions.width - padding.x, 100);
    const availableHeight = Math.max(containerDimensions.height - padding.y, 100);

    const scaleX = availableWidth / canvasDimensions.width;
    const scaleY = availableHeight / canvasDimensions.height;
    return Math.min(scaleX, scaleY);
  }, [containerDimensions, canvasDimensions, padding.x, padding.y]);

  // Reset zoom to fit container
  const resetToFit = useCallback(() => {
    const fit = calculateFitScale();
    setZoom(Math.round(fit * 100));
  }, [calculateFitScale, setZoom]);

  // Zoom by step percentage
  const zoomIn = useCallback(() => {
    setZoom(Math.min(zoom + 10, maxScale * 100));
  }, [zoom, setZoom, maxScale]);

  const zoomOut = useCallback(() => {
    setZoom(Math.max(zoom - 10, minScale * 100));
  }, [zoom, setZoom, minScale]);

  // Keyboard zoom shortcuts: +, -, 0
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomOut();
      } else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        resetToFit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetToFit]);

  return {
    zoomScale: zoom / 100,
    zoomPercentage: zoom,
    zoomIn,
    zoomOut,
    resetToFit,
    calculateFitScale,
  };
}

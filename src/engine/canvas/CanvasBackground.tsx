import React, { useMemo } from 'react';
import { Rect, Group } from 'react-konva';
import { BackgroundFill, CanvasDimensions } from '../state/types.ts';

interface CanvasBackgroundProps {
  fill: BackgroundFill;
  dimensions: CanvasDimensions;
}

export const CanvasBackground: React.FC<CanvasBackgroundProps> = ({ fill, dimensions }) => {
  const { width, height } = dimensions;

  const gradientPoints = useMemo(() => {
    if (fill.type !== 'gradient') return null;
    const rad = (fill.gradient.angle * Math.PI) / 180;
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.sqrt(cx * cx + cy * cy);

    return {
      start: {
        x: cx - Math.cos(rad) * r,
        y: cy - Math.sin(rad) * r,
      },
      end: {
        x: cx + Math.cos(rad) * r,
        y: cy + Math.sin(rad) * r,
      },
      colorStops: [0, fill.gradient.startColor, 1, fill.gradient.endColor],
    };
  }, [fill, width, height]);

  if (fill.type === 'transparent') {
    return null;
  }

  if (fill.type === 'solid') {
    return (
      <Group name="background-layer">
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={fill.color}
          listening={false}
        />
      </Group>
    );
  }

  if (fill.type === 'gradient' && gradientPoints) {
    return (
      <Group name="background-layer">
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fillLinearGradientStartPoint={gradientPoints.start}
          fillLinearGradientEndPoint={gradientPoints.end}
          fillLinearGradientColorStops={gradientPoints.colorStops}
          listening={false}
        />
      </Group>
    );
  }

  return null;
};

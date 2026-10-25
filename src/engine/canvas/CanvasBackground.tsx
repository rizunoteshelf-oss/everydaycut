import React, { useMemo } from 'react';
import { Rect, Group } from 'react-konva';
import { BackgroundFill, CanvasDimensions } from '../state/types.ts';

interface CanvasBackgroundProps {
  fill: BackgroundFill;
  dimensions: CanvasDimensions;
}

export const CanvasBackground: React.FC<CanvasBackgroundProps> = ({ fill, dimensions }) => {
  const { width, height } = dimensions;

  const gradientConfig = useMemo(() => {
    if (fill.type !== 'gradient') return null;

    const { startColor, midColor, endColor, angle, style = 'linear' } = fill.gradient;
    const rad = (angle * Math.PI) / 180;
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.sqrt(cx * cx + cy * cy);

    // Compute color stops (2-stop or 3-stop)
    let colorStops: Array<string | number>;
    if (midColor && midColor.trim().length > 0) {
      colorStops = [0, startColor, 0.5, midColor, 1, endColor];
    } else {
      colorStops = [0, startColor, 1, endColor];
    }

    return {
      style,
      cx,
      cy,
      r,
      start: {
        x: cx - Math.cos(rad) * r,
        y: cy - Math.sin(rad) * r,
      },
      end: {
        x: cx + Math.cos(rad) * r,
        y: cy + Math.sin(rad) * r,
      },
      colorStops,
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

  if (fill.type === 'gradient' && gradientConfig) {
    if (gradientConfig.style === 'radial') {
      return (
        <Group name="background-layer">
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fillRadialGradientStartPoint={{ x: gradientConfig.cx, y: gradientConfig.cy }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndPoint={{ x: gradientConfig.cx, y: gradientConfig.cy }}
            fillRadialGradientEndRadius={gradientConfig.r}
            fillRadialGradientColorStops={gradientConfig.colorStops}
            listening={false}
          />
        </Group>
      );
    }

    return (
      <Group name="background-layer">
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fillLinearGradientStartPoint={gradientConfig.start}
          fillLinearGradientEndPoint={gradientConfig.end}
          fillLinearGradientColorStops={gradientConfig.colorStops}
          listening={false}
        />
      </Group>
    );
  }

  return null;
};

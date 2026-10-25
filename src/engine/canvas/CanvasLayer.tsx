import React, { useRef, useEffect, useState } from 'react';
import { Image as KonvaImage, Transformer, Group, Text as KonvaText, Rect as KonvaRect } from 'react-konva';
import Konva from 'konva';
import { Layer } from '../state/types.ts';
import { computeKonvaShadow } from './shadowManager.ts';
import { useEditorStore } from '../state/editorStore.ts';

interface CanvasLayerProps {
  layer: Layer;
  isSelected: boolean;
  onSelect: () => void;
}

export const CanvasLayer: React.FC<CanvasLayerProps> = ({ layer, isSelected, onSelect }) => {
  const imageRef = useRef<Konva.Image>(null);
  const textRef = useRef<Konva.Text>(null);
  const groupRef = useRef<Konva.Group>(null);
  const softShadowRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  const { updateLayer, recordSnapshot } = useEditorStore();

  // Load image element from source if image layer
  useEffect(() => {
    if (layer.type === 'text' || !layer.src) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = layer.src;
    img.onload = () => {
      setImageObj(img);
    };
  }, [layer.src, layer.type]);

  // Apply visual filters (Brightness, Contrast, Saturation, Blur)
  useEffect(() => {
    const node = imageRef.current;
    if (!node || !imageObj || layer.type === 'text') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filters: any[] = [];
    if (layer.filters.brightness !== 0) {
      filters.push(Konva.Filters.Brighten);
      node.brightness(layer.filters.brightness / 100);
    }
    if (layer.filters.contrast !== 0) {
      filters.push(Konva.Filters.Contrast);
      node.contrast(layer.filters.contrast);
    }
    if (layer.filters.saturation && layer.filters.saturation !== 0) {
      filters.push(Konva.Filters.HSL);
      node.saturation((layer.filters.saturation || 0) / 100);
    }
    if (layer.filters.blur > 0) {
      filters.push(Konva.Filters.Blur);
      node.blurRadius(layer.filters.blur);
    }

    node.filters(filters);
    if (filters.length > 0) {
      node.cache();
    } else {
      node.clearCache();
    }
    node.getLayer()?.batchDraw();
  }, [layer.filters, imageObj, layer.type]);

  // Attach transformer when selected
  useEffect(() => {
    if (!isSelected || !trRef.current) return;

    if (layer.type === 'text' && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    } else if (imageRef.current) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, imageObj, layer.type]);

  const shadowAttrs = computeKonvaShadow(layer.shadow);
  const isSoftShadow = layer.shadow.type === 'soft_shadow' && layer.shadow.opacity > 0;

  // Render Text Layer
  if (layer.type === 'text') {
    const tc = layer.textConfig || {
      text: 'Sample Heading',
      fontSize: 48,
      fontFamily: 'sans-serif',
      fill: '#ffffff',
      fontWeight: 'bold',
      align: 'center' as const,
      badgeStyle: 'none' as const,
      badgeColor: '#22c55e',
      badgePadding: 16,
    };

    const pad = tc.badgePadding || 16;
    const textWidth = Math.max(100, (layer.width || 200) - pad * 2);
    const textHeight = Math.max(30, (layer.height || 60) - pad * 2);

    return (
      <React.Fragment>
        <Group
          ref={groupRef}
          x={layer.x}
          y={layer.y}
          scaleX={layer.scaleX}
          scaleY={layer.scaleY}
          rotation={layer.rotation}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragStart={() => recordSnapshot()}
          onDragEnd={(e) => {
            updateLayer(layer.id, {
              x: e.target.x(),
              y: e.target.y(),
            });
          }}
          onTransformStart={() => recordSnapshot()}
          onTransformEnd={() => {
            const node = groupRef.current;
            if (!node) return;
            updateLayer(layer.id, {
              x: node.x(),
              y: node.y(),
              scaleX: node.scaleX(),
              scaleY: node.scaleY(),
              rotation: node.rotation(),
            });
          }}
        >
          {/* Badge Background Rect */}
          {tc.badgeStyle !== 'none' && (
            <KonvaRect
              x={0}
              y={0}
              width={(layer.width || 200)}
              height={(layer.height || 60)}
              fill={tc.badgeStyle === 'outline' ? 'transparent' : tc.badgeColor}
              stroke={tc.badgeStyle === 'outline' ? tc.badgeColor : undefined}
              strokeWidth={tc.badgeStyle === 'outline' ? 3 : 0}
              cornerRadius={tc.badgeStyle === 'pill' ? 999 : 12}
              shadowEnabled={layer.shadow.type !== 'none'}
              shadowColor={layer.shadow.color}
              shadowBlur={layer.shadow.blur}
              shadowOpacity={layer.shadow.opacity}
              shadowOffsetX={layer.shadow.x}
              shadowOffsetY={layer.shadow.y}
            />
          )}

          <KonvaText
            ref={textRef}
            x={tc.badgeStyle !== 'none' ? pad : 0}
            y={tc.badgeStyle !== 'none' ? pad / 2 : 0}
            width={tc.badgeStyle !== 'none' ? textWidth : undefined}
            height={tc.badgeStyle !== 'none' ? textHeight : undefined}
            text={tc.text}
            fontSize={tc.fontSize}
            fontFamily={tc.fontFamily}
            fontStyle={tc.fontWeight}
            fill={tc.fill}
            align={tc.align}
            verticalAlign="middle"
          />
        </Group>

        {isSelected && (
          <Transformer
            ref={trRef}
            anchorSize={10}
            anchorCornerRadius={5}
            anchorStroke="#22c55e"
            anchorFill="#ffffff"
            borderStroke="#22c55e"
            borderDash={[4, 4]}
            rotateAnchorOffset={24}
          />
        )}
      </React.Fragment>
    );
  }

  // Render Image Layer
  return (
    <Group>
      {/* Soft shadow ground blur layer */}
      {isSoftShadow && imageObj && (
        <KonvaImage
          ref={softShadowRef}
          image={imageObj}
          x={layer.x + layer.shadow.x * 0.5}
          y={layer.y + layer.shadow.y + 12}
          width={layer.width}
          height={layer.height}
          scaleX={layer.scaleX}
          scaleY={layer.scaleY * 0.95}
          rotation={layer.rotation}
          opacity={layer.shadow.opacity * 0.4}
          shadowEnabled={true}
          shadowColor={layer.shadow.color}
          shadowBlur={layer.shadow.blur * 2}
          shadowOffsetY={8}
          shadowOpacity={0.8}
          listening={false}
        />
      )}

      {/* Main Subject Layer */}
      {imageObj && (
        <KonvaImage
          ref={imageRef}
          image={imageObj}
          x={layer.x}
          y={layer.y}
          width={layer.width}
          height={layer.height}
          scaleX={layer.scaleX}
          scaleY={layer.scaleY}
          rotation={layer.rotation}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragStart={() => {
            recordSnapshot();
          }}
          onDragEnd={(e) => {
            updateLayer(layer.id, {
              x: e.target.x(),
              y: e.target.y(),
            });
          }}
          onTransformStart={() => {
            recordSnapshot();
          }}
          onTransformEnd={() => {
            const node = imageRef.current;
            if (!node) return;
            updateLayer(layer.id, {
              x: node.x(),
              y: node.y(),
              scaleX: node.scaleX(),
              scaleY: node.scaleY(),
              rotation: node.rotation(),
            });
          }}
          {...shadowAttrs}
        />
      )}

      {/* Interactive Selection Transformer */}
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) {
              return oldBox;
            }
            return newBox;
          }}
          anchorSize={10}
          anchorCornerRadius={5}
          anchorStroke="#22c55e"
          anchorFill="#ffffff"
          borderStroke="#22c55e"
          borderDash={[4, 4]}
          rotateAnchorOffset={24}
        />
      )}
    </Group>
  );
};

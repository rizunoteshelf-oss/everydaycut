import React, { useRef, useEffect, useState } from 'react';
import { Image as KonvaImage, Transformer, Group } from 'react-konva';
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
  const softShadowRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  const { updateLayer, recordSnapshot } = useEditorStore();

  // Load image element from source
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = layer.src;
    img.onload = () => {
      setImageObj(img);
    };
  }, [layer.src]);

  // Attach transformer when selected
  useEffect(() => {
    if (isSelected && trRef.current && imageRef.current) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, imageObj]);

  const shadowAttrs = computeKonvaShadow(layer.shadow);

  // Soft shadow secondary ground contact calculation
  const isSoftShadow = layer.shadow.type === 'soft_shadow' && layer.shadow.opacity > 0;

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
            // Prevent inverted or zero-size box
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

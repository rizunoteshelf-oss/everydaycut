import Konva from 'konva';

export interface ExportOptions {
  format: 'png' | 'jpeg';
  quality?: number; // 0 to 1 for jpeg
  fileName?: string;
  targetDimensions?: { width: number; height: number };
  targetMaxSizeBytes?: number; // e.g. 30000 for PAN photo, 20000 for PAN signature
}

/**
 * Compresses an HTMLCanvasElement into a Blob with optional strict byte limit
 */
async function canvasToBlobWithLimit(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg',
  targetMaxBytes?: number,
  fallbackQuality: number = 0.92
): Promise<Blob> {
  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';

  if (format === 'png' || !targetMaxBytes) {
    return new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b || new Blob()), mime, fallbackQuality)
    );
  }

  // Binary search for exact optimal JPEG quality
  let low = 0.1;
  let high = 0.98;
  let bestBlob: Blob | null = null;

  for (let i = 0; i < 8; i++) {
    const mid = (low + high) / 2;
    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', mid)
    );

    if (blob.size <= targetMaxBytes) {
      bestBlob = blob;
      low = mid; // Try for higher quality within limit
    } else {
      high = mid; // Too big, reduce quality
    }
  }

  if (!bestBlob) {
    // If still over limit, try lowest quality
    bestBlob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.15)
    );
  }

  return bestBlob || new Blob();
}

export async function exportCanvasImage(
  stage: Konva.Stage,
  options: ExportOptions
): Promise<{ sizeBytes: number; width: number; height: number }> {
  const {
    format,
    quality = 0.95,
    fileName = 'everydaycut-export',
    targetDimensions,
    targetMaxSizeBytes,
  } = options;

  // Temporarily deselect all transformers before rendering screenshot
  const transformers = stage.find('Transformer');
  transformers.forEach((tr) => tr.hide());

  // Store previous scale and position so export is ALWAYS pristine 1:1 original canvas scale
  const prevScaleX = stage.scaleX();
  const prevScaleY = stage.scaleY();
  const prevX = stage.x();
  const prevY = stage.y();

  // Reset stage to full 1:1 scale and origin for crystal-clear HD export
  stage.scale({ x: 1, y: 1 });
  stage.position({ x: 0, y: 0 });
  stage.batchDraw();

  try {
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';

    // If targetDimensions or targetMaxSizeBytes is requested, render to an offscreen canvas
    if (targetDimensions || targetMaxSizeBytes) {
      const outW = targetDimensions ? targetDimensions.width : stage.width();
      const outH = targetDimensions ? targetDimensions.height : stage.height();

      // Render stage to high-res canvas
      const stageCanvas = stage.toCanvas({ pixelRatio: 2 });
      
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = outW;
      exportCanvas.height = outH;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) throw new Error('Could not create export canvas context');

      // If JPEG, fill white background by default for documents
      if (format === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outW, outH);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(stageCanvas, 0, 0, outW, outH);

      const blob = await canvasToBlobWithLimit(
        exportCanvas,
        format,
        targetMaxSizeBytes,
        quality
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${fileName}.${format}`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return {
        sizeBytes: blob.size,
        width: outW,
        height: outH,
      };
    }

    // Default fast export path
    const dataUrl = stage.toDataURL({
      pixelRatio: 2,
      mimeType,
      quality,
    });

    const link = document.createElement('a');
    link.download = `${fileName}.${format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return {
      sizeBytes: 0,
      width: stage.width(),
      height: stage.height(),
    };
  } finally {
    // Restore stage scale, position, and transformers
    stage.scale({ x: prevScaleX, y: prevScaleY });
    stage.position({ x: prevX, y: prevY });
    transformers.forEach((tr) => tr.show());
    stage.batchDraw();
  }
}


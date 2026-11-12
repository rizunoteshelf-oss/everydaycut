import Konva from 'konva';

export type ExportFormat = 'png' | 'jpeg' | 'webp';

export interface ExportOptions {
  format: ExportFormat;
  quality?: number; // 0 to 1 for jpeg/webp
  fileName?: string;
  targetDimensions?: { width: number; height: number };
  targetMaxSizeBytes?: number; // e.g. 30000 for PAN photo, 20000 for PAN signature
  embed300Dpi?: boolean;
}

/**
 * Injects 300 DPI metadata into JFIF APP0 header segment of a JPEG byte array
 */
export function injectJfif300Dpi(buffer: ArrayBuffer): Uint8Array {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] !== 0xFF || bytes[1] !== 0xD8) {
    return bytes; // Not a valid JPEG
  }

  // Check if JFIF APP0 segment already exists
  if (
    bytes[2] === 0xFF &&
    bytes[3] === 0xE0 &&
    bytes[6] === 0x4A && // 'J'
    bytes[7] === 0x46 && // 'F'
    bytes[8] === 0x49 && // 'I'
    bytes[9] === 0x46 && // 'F'
    bytes[10] === 0x00
  ) {
    const copy = new Uint8Array(bytes);
    copy[13] = 1; // Units = Dots per inch (DPI)
    copy[14] = 0x01; // Xdensity high byte: 300 >> 8 = 1
    copy[15] = 0x2C; // Xdensity low byte: 300 & 0xFF = 44 (0x2C)
    copy[16] = 0x01; // Ydensity high byte: 300 >> 8 = 1
    copy[17] = 0x2C; // Ydensity low byte: 300 & 0xFF = 44 (0x2C)
    return copy;
  }

  // If no standard JFIF header exists, create and inject an 18-byte JFIF segment after SOI
  const jfifHeader = new Uint8Array([
    0xFF, 0xE0, // APP0 marker
    0x00, 0x10, // Length = 16 bytes
    0x4A, 0x46, 0x49, 0x46, 0x00, // 'JFIF\0'
    0x01, 0x01, // Version 1.1
    0x01,       // Units = Dots per inch (DPI)
    0x01, 0x2C, // Xdensity = 300 DPI
    0x01, 0x2C, // Ydensity = 300 DPI
    0x00, 0x00  // Thumbnail size = 0x0
  ]);

  const output = new Uint8Array(bytes.length + jfifHeader.length);
  output[0] = 0xFF;
  output[1] = 0xD8;
  output.set(jfifHeader, 2);
  output.set(bytes.subarray(2), 2 + jfifHeader.length);
  return output;
}

/**
 * Compresses an HTMLCanvasElement into a Blob with optional strict byte limit
 */
async function canvasToBlobWithLimit(
  canvas: HTMLCanvasElement,
  format: ExportFormat,
  targetMaxBytes?: number,
  fallbackQuality: number = 0.92,
  embed300Dpi: boolean = false
): Promise<Blob> {
  const mime =
    format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';

  const makeBlob = async (q: number): Promise<Blob> => {
    return new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b || new Blob()), mime, q)
    );
  };

  let rawBlob: Blob;

  if (format === 'png' || !targetMaxBytes) {
    rawBlob = await makeBlob(fallbackQuality);
  } else {
    // Binary search for exact optimal JPEG / WebP quality
    let low = 0.02;
    let high = 0.98;
    let bestBlob: Blob | null = null;

    for (let i = 0; i < 10; i++) {
      const mid = (low + high) / 2;
      const candidate = await makeBlob(mid);

      if (candidate.size <= targetMaxBytes) {
        bestBlob = candidate;
        low = mid; // Try higher quality within limit
      } else {
        high = mid; // Too big, reduce quality
      }
    }

    rawBlob = bestBlob || (await makeBlob(0.02));
  }

  // Inject 300 DPI metadata for JPEG if requested
  if (format === 'jpeg' && embed300Dpi) {
    const arrayBuf = await rawBlob.arrayBuffer();
    const patchedBytes = injectJfif300Dpi(arrayBuf);
    return new Blob([patchedBytes.buffer as ArrayBuffer], { type: 'image/jpeg' });
  }

  return rawBlob;
}

export async function exportCanvasImage(
  stage: Konva.Stage,
  options: ExportOptions
): Promise<{ sizeBytes: number; width: number; height: number; blob?: Blob }> {
  const {
    format,
    quality = 0.95,
    fileName = 'everydaycut-export',
    targetDimensions,
    targetMaxSizeBytes,
    embed300Dpi = false,
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
    const outW = targetDimensions ? targetDimensions.width : stage.width();
    const outH = targetDimensions ? targetDimensions.height : stage.height();

    // Render stage to high-res canvas (pixelRatio 2 for crisp display rendering, 1 for fixed dimensions)
    const renderPixelRatio = targetDimensions ? 1 : 2;
    const stageCanvas = stage.toCanvas({ pixelRatio: renderPixelRatio });

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = outW;
    exportCanvas.height = outH;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) throw new Error('Could not create export canvas context');

    // If JPEG, fill white background by default for opaque documents
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
      quality,
      embed300Dpi
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${fileName}.${format === 'jpeg' ? 'jpg' : format}`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      sizeBytes: blob.size,
      width: outW,
      height: outH,
      blob,
    };
  } finally {
    // Restore stage scale, position, and transformers
    stage.scale({ x: prevScaleX, y: prevScaleY });
    stage.position({ x: prevX, y: prevY });
    transformers.forEach((tr) => tr.show());
    stage.batchDraw();
  }
}

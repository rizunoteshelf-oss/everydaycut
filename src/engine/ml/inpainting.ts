/**
 * Client-Side Inpainting Engine (Magic Eraser)
 * Fast Marching & Directional Laplacian Texture Diffusion
 * Boundary-Aware & Alpha-Clamped for Background-Removed Cutouts
 * 100% In-Browser Execution ($0 Cloud Server Cost)
 */

export interface LayerTransform {
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
}

export interface InpaintResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
}

export async function inpaintImage(
  sourceImage: HTMLImageElement,
  maskCanvas: HTMLCanvasElement,
  layerTransform?: LayerTransform
): Promise<InpaintResult> {
  const width = sourceImage.naturalWidth || sourceImage.width;
  const height = sourceImage.naturalHeight || sourceImage.height;

  // 1. Setup working canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Failed to create inpainting 2D context.');

  ctx.drawImage(sourceImage, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height);
  const pixels = imgData.data;

  // 2. Read mask data accurately transformed from Stage coordinates into Image local coordinates
  const scaledMaskCanvas = document.createElement('canvas');
  scaledMaskCanvas.width = width;
  scaledMaskCanvas.height = height;
  const maskCtx = scaledMaskCanvas.getContext('2d', { willReadFrequently: true });
  if (!maskCtx) throw new Error('Failed to create mask context.');

  if (layerTransform) {
    const sX = layerTransform.scaleX || 1;
    const sY = layerTransform.scaleY || 1;
    const dispW = layerTransform.width * sX;
    const dispH = layerTransform.height * sY;
    const scaleFactorX = width / Math.max(dispW, 1);
    const scaleFactorY = height / Math.max(dispH, 1);

    maskCtx.save();
    maskCtx.scale(scaleFactorX, scaleFactorY);
    if (layerTransform.rotation) {
      const cx = layerTransform.x + dispW / 2;
      const cy = layerTransform.y + dispH / 2;
      maskCtx.translate(cx, cy);
      maskCtx.rotate((-layerTransform.rotation * Math.PI) / 180);
      maskCtx.translate(-cx, -cy);
    }
    maskCtx.translate(-layerTransform.x, -layerTransform.y);
    maskCtx.drawImage(maskCanvas, 0, 0);
    maskCtx.restore();
  } else {
    maskCtx.drawImage(maskCanvas, 0, 0, width, height);
  }

  const maskData = maskCtx.getImageData(0, 0, width, height).data;

  // 3. Extract binary mask & compute bounding box
  const mask = new Uint8Array(width * height);
  let minX = width, minY = height, maxX = 0, maxY = 0;
  let maskedPixelCount = 0;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      const idx = (rowOffset + x) * 4;
      // If mask has opacity > 20
      if (maskData[idx + 3] > 20) {
        mask[rowOffset + x] = 1;
        maskedPixelCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // If nothing was masked, return unmodified image
  if (maskedPixelCount === 0) {
    const blob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png')
    );
    return { blob, url: URL.createObjectURL(blob), width, height };
  }

  // Add 24px padding around bounding box for context sampling
  const pad = 24;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  // 4. Pass 1: Multi-Directional Ray-Casting Boundary Interpolation
  const angles = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5];
  const cosAngles = angles.map((a) => Math.cos((a * Math.PI) / 180));
  const sinAngles = angles.map((a) => Math.sin((a * Math.PI) / 180));

  for (let y = minY; y <= maxY; y++) {
    const rowOffset = y * width;
    for (let x = minX; x <= maxX; x++) {
      if (mask[rowOffset + x] !== 1) continue;

      let totalR = 0, totalG = 0, totalB = 0, totalA = 0;
      let totalWeight = 0;

      for (let k = 0; k < angles.length; k++) {
        const dx = cosAngles[k];
        const dy = sinAngles[k];
        let step = 1;
        let found = false;

        while (step < 160) {
          const sampleX = Math.round(x + dx * step);
          const sampleY = Math.round(y + dy * step);

          if (sampleX < 0 || sampleX >= width || sampleY < 0 || sampleY >= height) {
            break;
          }

          const sOffset = sampleY * width + sampleX;
          // Clean unmasked AND opaque pixel
          if (mask[sOffset] === 0) {
            const pIdx = sOffset * 4;
            const alpha = pixels[pIdx + 3];

            // Crucial: Only sample pixels that have solid opacity (> 30)
            // This prevents transparent cutout background from bleeding black holes!
            if (alpha > 30) {
              const dist = step;
              const weight = 1 / (dist * dist + 1);

              totalR += pixels[pIdx] * weight;
              totalG += pixels[pIdx + 1] * weight;
              totalB += pixels[pIdx + 2] * weight;
              totalA += alpha * weight;
              totalWeight += weight;
              found = true;
              break;
            }
          }
          step += 1.5;
        }

        if (!found) continue;
      }

      if (totalWeight > 0) {
        const idx = (rowOffset + x) * 4;
        pixels[idx] = Math.round(totalR / totalWeight);
        pixels[idx + 1] = Math.round(totalG / totalWeight);
        pixels[idx + 2] = Math.round(totalB / totalWeight);
        pixels[idx + 3] = Math.round(totalA / totalWeight);
      }
    }
  }

  // 5. Pass 2: Iterative Laplacian Diffusion Smoothing (8 passes inside bounding box)
  const workBuffer = new Uint8ClampedArray(pixels);

  for (let iter = 0; iter < 8; iter++) {
    for (let y = minY; y <= maxY; y++) {
      const rowOffset = y * width;
      for (let x = minX; x <= maxX; x++) {
        if (mask[rowOffset + x] !== 1) continue;

        let rSum = 0, gSum = 0, bSum = 0, aSum = 0;
        let count = 0;

        // 3x3 Gaussian weighted neighborhood
        for (let dy = -1; dy <= 1; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= height) continue;
          const nRow = ny * width;

          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= width) continue;

            const nIdx = (nRow + nx) * 4;
            // Only diffuse with non-transparent neighbors
            if (workBuffer[nIdx + 3] > 30) {
              const w = (dx === 0 && dy === 0) ? 2 : (dx === 0 || dy === 0) ? 1.5 : 1;
              rSum += workBuffer[nIdx] * w;
              gSum += workBuffer[nIdx + 1] * w;
              bSum += workBuffer[nIdx + 2] * w;
              aSum += workBuffer[nIdx + 3] * w;
              count += w;
            }
          }
        }

        if (count > 0) {
          const pIdx = (rowOffset + x) * 4;
          pixels[pIdx] = Math.round(rSum / count);
          pixels[pIdx + 1] = Math.round(gSum / count);
          pixels[pIdx + 2] = Math.round(bSum / count);
          pixels[pIdx + 3] = Math.round(aSum / count);
        }
      }
    }
    workBuffer.set(pixels);
  }

  // 6. Output to canvas & Blob
  ctx.putImageData(imgData, 0, 0);

  const blob = await new Promise<Blob>((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png')
  );

  return {
    blob,
    url: URL.createObjectURL(blob),
    width,
    height,
  };
}

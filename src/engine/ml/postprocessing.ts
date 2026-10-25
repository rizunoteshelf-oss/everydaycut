/**
 * Post-processing pipeline for background removal.
 * Composites the predicted alpha mask onto the original image at full resolution
 * and applies edge feathering/smoothing for crisp cutouts.
 */

export interface PostProcessOptions {
  featherRadius?: number; // 0 to 5px edge feathering
}

export async function compositeAlphaMask(
  sourceImage: ImageBitmap | HTMLImageElement,
  maskData: Uint8ClampedArray | Uint8Array,
  maskWidth: number,
  maskHeight: number,
  options: PostProcessOptions = {}
): Promise<{ blob: Blob; url: string; width: number; height: number }> {
  const { featherRadius = 1 } = options;

  const originalWidth = sourceImage.width;
  const originalHeight = sourceImage.height;

  // Use OffscreenCanvas if supported, otherwise create a memory canvas
  const canvas = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(originalWidth, originalHeight)
    : document.createElement('canvas');

  canvas.width = originalWidth;
  canvas.height = originalHeight;

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  if (!ctx) {
    throw new Error('Failed to obtain 2D canvas context for postprocessing.');
  }

  // 1. Draw original source image at 100% full natural resolution
  ctx.drawImage(sourceImage, 0, 0, originalWidth, originalHeight);
  const imageData = ctx.getImageData(0, 0, originalWidth, originalHeight);
  const pixels = imageData.data;

  // 2. Scale mask to match original dimensions if mask was computed at model resolution (e.g. 1024x1024)
  let finalAlphaMask: Uint8ClampedArray | Uint8Array = maskData;
  if (maskWidth !== originalWidth || maskHeight !== originalHeight) {
    const maskCanvas = typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(maskWidth, maskHeight)
      : document.createElement('canvas');
    maskCanvas.width = maskWidth;
    maskCanvas.height = maskHeight;
    const maskCtx = maskCanvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    // Create grayscale image from maskData
    const maskImgData = maskCtx.createImageData(maskWidth, maskHeight);
    for (let i = 0; i < maskData.length; i++) {
      const val = maskData[i];
      const offset = i * 4;
      maskImgData.data[offset] = val;
      maskImgData.data[offset + 1] = val;
      maskImgData.data[offset + 2] = val;
      maskImgData.data[offset + 3] = 255;
    }
    maskCtx.putImageData(maskImgData, 0, 0);

    // Resize to original image size using bicubic interpolation
    const scaledMaskCanvas = typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(originalWidth, originalHeight)
      : document.createElement('canvas');
    scaledMaskCanvas.width = originalWidth;
    scaledMaskCanvas.height = originalHeight;
    const scaledCtx = scaledMaskCanvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    
    scaledCtx.imageSmoothingEnabled = true;
    scaledCtx.imageSmoothingQuality = 'high';
    scaledCtx.drawImage(maskCanvas, 0, 0, originalWidth, originalHeight);

    const scaledMaskImgData = scaledCtx.getImageData(0, 0, originalWidth, originalHeight);
    const scaledMaskBytes = new Uint8ClampedArray(originalWidth * originalHeight);
    for (let i = 0; i < scaledMaskBytes.length; i++) {
      scaledMaskBytes[i] = scaledMaskImgData.data[i * 4]; // read red channel as luminance
    }
    finalAlphaMask = scaledMaskBytes;
  }

  // 3. Optional edge feathering (1px blur) to prevent harsh anti-aliasing artifacts
  if (featherRadius > 0) {
    finalAlphaMask = boxBlur1D(finalAlphaMask, originalWidth, originalHeight, featherRadius);
  }

  // 4. Inject alpha channel into full-res image data
  const totalPixels = originalWidth * originalHeight;
  for (let i = 0; i < totalPixels; i++) {
    const alphaVal = finalAlphaMask[i];
    // Modulate original alpha with mask
    pixels[i * 4 + 3] = Math.round((pixels[i * 4 + 3] * alphaVal) / 255);
  }

  ctx.putImageData(imageData, 0, 0);

  // 5. Convert to Blob
  let blob: Blob;
  if ('convertToBlob' in canvas) {
    blob = await (canvas as OffscreenCanvas).convertToBlob({ type: 'image/png' });
  } else {
    blob = await new Promise<Blob>((resolve, reject) => {
      (canvas as HTMLCanvasElement).toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas toBlob conversion failed'));
      }, 'image/png');
    });
  }

  const url = URL.createObjectURL(blob);
  return {
    blob,
    url,
    width: originalWidth,
    height: originalHeight,
  };
}

/**
 * Fast single-pass box blur on 8-bit alpha mask buffer for feathering.
 */
function boxBlur1D(
  src: Uint8ClampedArray | Uint8Array,
  w: number,
  h: number,
  radius: number
): Uint8ClampedArray {
  const dst = new Uint8ClampedArray(src.length);
  const kernelSize = radius * 2 + 1;

  for (let y = 0; y < h; y++) {
    const rowOffset = y * w;
    let sum = 0;

    for (let i = -radius; i <= radius; i++) {
      const x = Math.min(Math.max(i, 0), w - 1);
      sum += src[rowOffset + x];
    }
    dst[rowOffset] = Math.round(sum / kernelSize);

    for (let x = 1; x < w; x++) {
      const prevX = Math.max(x - radius - 1, 0);
      const nextX = Math.min(x + radius, w - 1);
      sum += src[rowOffset + nextX] - src[rowOffset + prevX];
      dst[rowOffset + x] = Math.round(sum / kernelSize);
    }
  }

  return dst;
}

/**
 * Clean & High-Contrast Signature Filter for Government Documents (PAN Card, NSDL, UTIITSL)
 * Converts mobile phone photos of pen signatures into clean, dark ink on crisp white paper.
 */

export async function processSignatureToMonochrome(
  imageSource: string | HTMLImageElement
): Promise<{ dataUrl: string; width: number; height: number }> {
  const img: HTMLImageElement = await new Promise((resolve, reject) => {
    if (typeof imageSource === 'string') {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = imageSource;
    } else {
      resolve(imageSource);
    }
  });

  const canvas = document.createElement('canvas');
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  ctx.drawImage(img, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // 1. Calculate luminance histogram to determine dynamic paper background threshold
  const totalPixels = width * height;
  let sumLuminance = 0;
  const grayValues = new Uint8Array(totalPixels);

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // Standard perceptual luminance
    const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    grayValues[i] = lum;
    sumLuminance += lum;
  }

  const avgLum = sumLuminance / totalPixels;
  // Ink threshold typically 75% of background brightness to filter out shadows
  const threshold = Math.max(70, Math.min(210, avgLum * 0.78));

  // 2. High-contrast thresholding with soft edge anti-aliasing
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const lum = grayValues[i];

    if (lum > threshold) {
      // Paper background -> Pure crisp white
      data[idx] = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = 255;
    } else {
      // Pen stroke -> Enhance to deep crisp dark ink
      const factor = lum / threshold; // 0 (pure ink) to 1 (near edge)
      const inkVal = Math.round(factor * 35); // smooth ink transition
      data[idx] = inkVal;
      data[idx + 1] = inkVal;
      data[idx + 2] = inkVal;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.95),
    width,
    height,
  };
}

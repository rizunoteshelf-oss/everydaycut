import { pipeline, env, RawImage } from '@huggingface/transformers';

// Disable remote telemetry & local filesystem checks
env.allowLocalModels = false;

// Optimize ONNX Runtime WASM threads
if (env.backends?.onnx?.wasm) {
  env.backends.onnx.wasm.numThreads = Math.min(4, typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 2) : 2);
}

const MODEL_ID = 'briaai/RMBG-1.4';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let segmenterInstance: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let segmenterPromise: Promise<any> | null = null;

async function getSegmenter(): Promise<any> {
  if (segmenterInstance) return segmenterInstance;
  if (segmenterPromise) return segmenterPromise;

  segmenterPromise = (async () => {
    const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;
    const initialDevice = hasWebGPU ? 'webgpu' : 'wasm';
    const initialDtype = hasWebGPU ? 'fp32' : 'q8';

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pipe = await pipeline('image-segmentation', MODEL_ID, {
        device: initialDevice,
        dtype: initialDtype,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        progress_callback: (data: any) => {
          if (data && data.status === 'progress' && data.total) {
            const pct = Math.round((data.loaded / data.total) * 100);
            self.postMessage({
              type: 'MODEL_PROGRESS',
              payload: {
                progress: pct,
                file: data.file,
                loaded: data.loaded,
                total: data.total,
              },
            });
          }
        },
      });
      segmenterInstance = pipe;
      return pipe;
    } catch (gpuError) {
      console.warn('Initial device failed, falling back to WASM / CPU:', gpuError);
      // Fallback to CPU WASM
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pipe = await pipeline('image-segmentation', MODEL_ID, {
        device: 'wasm',
        dtype: 'q8',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        progress_callback: (data: any) => {
          if (data && data.status === 'progress' && data.total) {
            const pct = Math.round((data.loaded / data.total) * 100);
            self.postMessage({
              type: 'MODEL_PROGRESS',
              payload: {
                progress: pct,
                file: data.file,
                loaded: data.loaded,
                total: data.total,
              },
            });
          }
        },
      });
      segmenterInstance = pipe;
      return pipe;
    }
  })();

  return segmenterPromise;
}

self.onmessage = async (e: MessageEvent) => {
  const { id, type, payload } = e.data;

  if (type === 'WARMUP') {
    try {
      await getSegmenter();
      self.postMessage({ id, type: 'WARMUP_SUCCESS' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      self.postMessage({ id, type: 'ERROR', error: msg });
    }
    return;
  }

  if (type === 'SEGMENT') {
    try {
      const { imageBlobUrl, imageBitmap } = payload;
      const segmenter = await getSegmenter();

      self.postMessage({ id, type: 'INFERENCE_START' });

      // Load image into RawImage format
      let rawImage: RawImage;
      if (imageBlobUrl) {
        rawImage = await RawImage.fromURL(imageBlobUrl);
      } else if (imageBitmap) {
        rawImage = await RawImage.fromCanvas(imageBitmap);
      } else {
        throw new Error('No valid image supplied for segmentation.');
      }

      // Execute segmentation pipeline
      const output = await segmenter(rawImage);

      // Handle output formats: either an array of { mask: RawImage } or a single RawImage
      let maskRaw: RawImage;
      if (Array.isArray(output) && output.length > 0 && output[0].mask) {
        maskRaw = output[0].mask;
      } else if (output instanceof RawImage) {
        maskRaw = output;
      } else if (Array.isArray(output) && output[0] instanceof RawImage) {
        maskRaw = output[0];
      } else {
        throw new Error('Unexpected segmentation output shape from model.');
      }

      // Extract raw grayscale mask data (Uint8Array)
      const maskBytes = new Uint8ClampedArray(maskRaw.data);
      const buffer = maskBytes.buffer;

      (self as unknown as { postMessage: (msg: unknown, transfer?: Transferable[]) => void }).postMessage(
        {
          id,
          type: 'SEGMENT_SUCCESS',
          payload: {
            maskBuffer: buffer,
            maskWidth: maskRaw.width,
            maskHeight: maskRaw.height,
            originalWidth: rawImage.width,
            originalHeight: rawImage.height,
          },
        },
        [buffer]
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Segmentation Worker Error:', err);
      self.postMessage({ id, type: 'ERROR', error: msg });
    }
  }
};

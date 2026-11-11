import { pipeline, env, RawImage } from '@huggingface/transformers';

// Disable remote telemetry & local filesystem checks
env.allowLocalModels = false;
env.useBrowserCache = true;

// Detect Safari / WebKit environment
const isSafari = typeof navigator !== 'undefined' && (
  (/safari/i.test(navigator.userAgent) && !/chrome|chromium|edg|android/i.test(navigator.userAgent)) ||
  Boolean(navigator.vendor && navigator.vendor.includes('Apple')) ||
  /iP(ad|hone|od)/.test(navigator.userAgent)
);

// Determine local WASM serving directory on our own origin
const workerOrigin = typeof self !== 'undefined' && self.location ? self.location.origin : '';
const wasmDir = `${workerOrigin}/wasm/`;

function configureOnnxWasm() {
  if (env.backends?.onnx?.wasm) {
    env.backends.onnx.wasm.wasmPaths = wasmDir;
    // CRITICAL SAFARI / WEBKIT FIX:
    // In Safari, multi-threaded pthreads inside Web Workers causes a fatal deadlock in InferenceSession.create.
    // Force numThreads = 1 on Safari. Chrome/Firefox safely use up to 4 threads.
    env.backends.onnx.wasm.numThreads = isSafari ? 1 : Math.min(4, typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 2) : 2);
    env.backends.onnx.wasm.proxy = false;
  }
}

// Initial configuration
configureOnnxWasm();

const MODEL_ID = 'briaai/RMBG-1.4';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let segmenterInstance: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let segmenterPromise: Promise<any> | null = null;

async function getSegmenter(): Promise<any> {
  if (segmenterInstance) return segmenterInstance;
  if (segmenterPromise) return segmenterPromise;

  segmenterPromise = (async () => {
    configureOnnxWasm();

    // Safari's experimental WebGPU inside Web Workers frequently hangs during WGSL shader compilation.
    // For Safari, directly use WASM SIMD, which runs in ~1.5s on Apple Silicon without hanging.
    // For Chrome and Edge, WebGPU is stable and hardware-accelerated.
    const hasWebGPU = !isSafari && typeof navigator !== 'undefined' && 'gpu' in navigator;
    const initialDevice = hasWebGPU ? 'webgpu' : 'wasm';
    const initialDtype = 'q8'; // 44MB quantized INT8 weights

    const loadPipelineWithTimeout = async (device: 'webgpu' | 'wasm', timeoutMs: number = 15000) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pipePromise = pipeline('image-segmentation', MODEL_ID, {
        device,
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

      const timerPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Model initialization timed out on ${device}`)), timeoutMs)
      );

      return Promise.race([pipePromise, timerPromise]);
    };

    try {
      const pipe = await loadPipelineWithTimeout(initialDevice, 20000);
      segmenterInstance = pipe;
      return pipe;
    } catch (gpuError) {
      console.warn(`Device ${initialDevice} failed or timed out, falling back to WASM / CPU:`, gpuError);
      configureOnnxWasm();
      // Fallback to CPU WASM
      const pipe = await loadPipelineWithTimeout('wasm', 25000);
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
      console.warn('Silent Warmup failed (non-blocking):', msg);
      self.postMessage({ id, type: 'WARMUP_SUCCESS' });
    }
    return;
  }

  if (type === 'SEGMENT') {
    try {
      const { pixelBuffer, width, height, channels = 4 } = payload;
      const segmenter = await getSegmenter();

      self.postMessage({ id, type: 'INFERENCE_START' });

      // Create RawImage directly from transferred memory buffer (Zero network latency, Zero blob fetch bugs)
      const rawImage = new RawImage(new Uint8Array(pixelBuffer), width, height, channels);

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

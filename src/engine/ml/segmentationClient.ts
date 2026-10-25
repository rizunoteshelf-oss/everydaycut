import { compositeAlphaMask } from './postprocessing.ts';
import { useEditorStore } from '../state/editorStore.ts';

export interface SegmentationResult {
  cutoutBlob: Blob;
  cutoutUrl: string;
  width: number;
  height: number;
}

export interface ProgressCallback {
  (progress: number, message: string): void;
}

export interface SegmentationOptions {
  silent?: boolean;
}

class SegmentationClient {
  private worker: Worker | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pendingRequests = new Map<string, { resolve: (val: any) => void; reject: (err: any) => void }>();
  private isInitialized = false;
  private isUserSegmenting = false;
  private modelReady = false;
  private modelDownloaded = false;

  private initWorker(): Worker {
    if (this.worker) return this.worker;

    // Use versioned query param to force cache-busting in Safari
    this.worker = new Worker(new URL('./segmentation.worker.ts?v=3', import.meta.url), {
      type: 'module',
    });

    this.worker.onmessage = (e: MessageEvent) => {
      const { id, type, payload, error } = e.data;

      if (type === 'MODEL_PROGRESS') {
        const { progress, file, loaded, total } = payload || {};
        if (progress === 100) {
          this.modelDownloaded = true;
        }

        // Only show full-screen overlay if the user is actively waiting on an image
        if (this.isUserSegmenting) {
          const fileName = file ? file.split('/').pop() : 'neural weights';
          const loadedMB = loaded ? (loaded / (1024 * 1024)).toFixed(1) : null;
          const totalMB = total ? (total / (1024 * 1024)).toFixed(1) : null;
          const sizeInfo = loadedMB && totalMB ? ` (${loadedMB}MB of ${totalMB}MB)` : ` (${progress}%)`;

          let msg = `One-time setup: Downloading ${fileName}${sizeInfo}.`;
          if (progress === 100) {
            msg = `Download complete! Initializing neural model in memory...`;
          }

          useEditorStore.getState().setSegmentationProgress({
            status: 'loading_model',
            progress: progress ?? 0,
            message: msg,
          });
        }
        return;
      }

      if (type === 'INFERENCE_START') {
        if (this.isUserSegmenting) {
          useEditorStore.getState().setSegmentationProgress({
            status: 'processing',
            progress: 85,
            message: 'Extracting subject mask (AI neural inference)...',
          });
        }
        return;
      }

      if (type === 'WARMUP_SUCCESS') {
        this.modelReady = true;
        this.modelDownloaded = true;
        this.isUserSegmenting = false;
        useEditorStore.getState().setSegmentationProgress({
          status: 'idle',
          progress: 0,
          message: '',
        });
      }

      const pending = id ? this.pendingRequests.get(id) : null;
      if (!pending) return;

      this.pendingRequests.delete(id);

      if (type === 'ERROR') {
        this.isUserSegmenting = false;
        pending.reject(new Error(error || 'Worker error'));
      } else if (type === 'SEGMENT_SUCCESS') {
        this.modelReady = true;
        this.isUserSegmenting = false;
        useEditorStore.getState().setSegmentationProgress({
          status: 'idle',
          progress: 0,
          message: '',
        });
        pending.resolve(payload);
      } else if (type === 'WARMUP_SUCCESS') {
        pending.resolve(true);
      }
    };

    this.worker.onerror = (err) => {
      console.error('Segmentation Worker Fatal Error:', err);
      if (this.isUserSegmenting) {
        useEditorStore.getState().setSegmentationProgress({
          status: 'error',
          progress: 0,
          message: 'Worker failed to initialize. Please verify WebGPU / WASM support.',
        });
      }
    };

    return this.worker;
  }

  public warmup(): void {
    if (this.isInitialized) return;
    const worker = this.initWorker();
    const id = `warmup_${Date.now()}`;
    worker.postMessage({ id, type: 'WARMUP' });
    this.isInitialized = true;
  }

  public cancel(): void {
    this.isUserSegmenting = false;
    useEditorStore.getState().setSegmentationProgress({
      status: 'idle',
      progress: 0,
      message: '',
    });
  }

  public async removeBackground(
    imageSource: File | Blob | string,
    onProgress?: ProgressCallback,
    options?: SegmentationOptions
  ): Promise<SegmentationResult> {
    const isSilent = options?.silent ?? false;
    if (!isSilent) {
      this.isUserSegmenting = true;
    }

    const worker = this.initWorker();
    const id = `seg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Prepare image input
    let imageBlobUrl: string;
    let shouldRevokeUrl = false;
    let imgElement: HTMLImageElement;

    if (imageSource instanceof File || imageSource instanceof Blob) {
      imageBlobUrl = URL.createObjectURL(imageSource);
      shouldRevokeUrl = true;
    } else {
      imageBlobUrl = imageSource;
    }

    try {
      // Load original image on main thread to retain 100% natural dimensions and pixels
      imgElement = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image element.'));
        img.src = imageBlobUrl;
      });
    } catch (loadErr) {
      if (shouldRevokeUrl) URL.revokeObjectURL(imageBlobUrl);
      if (!isSilent) {
        this.isUserSegmenting = false;
        useEditorStore.getState().setSegmentationProgress({
          status: 'error',
          progress: 0,
          message: 'Failed to decode image. Please check file format.',
        });
      }
      throw loadErr;
    }

    if (!isSilent) {
      if (this.modelReady) {
        useEditorStore.getState().setSegmentationProgress({
          status: 'processing',
          progress: 40,
          message: 'Extracting subject mask (AI neural inference)...',
        });
      } else {
        useEditorStore.getState().setSegmentationProgress({
          status: 'loading_model',
          progress: this.modelDownloaded ? 95 : 15,
          message: this.modelDownloaded
            ? 'Initializing neural model in memory...'
            : 'One-time setup: Preparing AI model in browser...',
        });
      }
    }

    onProgress?.(20, 'Preparing image canvas...');

    // Extract pixel buffer directly on main thread to bypass Safari worker blob URL fetch issues
    const maxDim = 1024;
    let inferenceW = imgElement.naturalWidth || imgElement.width;
    let inferenceH = imgElement.naturalHeight || imgElement.height;
    if (inferenceW > maxDim || inferenceH > maxDim) {
      if (inferenceW > inferenceH) {
        inferenceH = Math.round((inferenceH * maxDim) / inferenceW);
        inferenceW = maxDim;
      } else {
        inferenceW = Math.round((inferenceW * maxDim) / inferenceH);
        inferenceH = maxDim;
      }
    }

    const offscreen = document.createElement('canvas');
    offscreen.width = inferenceW;
    offscreen.height = inferenceH;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) {
      if (shouldRevokeUrl) URL.revokeObjectURL(imageBlobUrl);
      if (!isSilent) {
        this.isUserSegmenting = false;
        useEditorStore.getState().setSegmentationProgress({
          status: 'error',
          progress: 0,
          message: 'Failed to allocate 2D canvas context for inference.',
        });
      }
      throw new Error('Failed to obtain 2D canvas context for inference');
    }

    offCtx.drawImage(imgElement, 0, 0, inferenceW, inferenceH);
    const imgData = offCtx.getImageData(0, 0, inferenceW, inferenceH);
    const pixelBuffer = imgData.data.buffer;

    return new Promise<SegmentationResult>((resolve, reject) => {
      // 35s watchdog timer to guarantee user is never locked in an infinite hang
      const watchdog = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          if (shouldRevokeUrl) URL.revokeObjectURL(imageBlobUrl);
          if (!isSilent) {
            this.isUserSegmenting = false;
            useEditorStore.getState().setSegmentationProgress({
              status: 'error',
              progress: 0,
              message: 'Segmentation processing timed out. Please try again.',
            });
          }
          reject(new Error('Segmentation processing timed out. Please try again.'));
        }
      }, 35000);

      this.pendingRequests.set(id, {
        resolve: async (rawResult) => {
          clearTimeout(watchdog);
          try {
            const { maskBuffer, maskWidth, maskHeight } = rawResult;
            const maskBytes = new Uint8ClampedArray(maskBuffer);

            if (!isSilent) {
              useEditorStore.getState().setSegmentationProgress({
                status: 'processing',
                progress: 95,
                message: 'Compositing alpha matte & edge feathering...',
              });
            }
            onProgress?.(95, 'Compositing alpha matte...');

            // Composite alpha mask at 100% full original natural resolution
            const { blob, url, width, height } = await compositeAlphaMask(
              imgElement,
              maskBytes,
              maskWidth,
              maskHeight,
              { featherRadius: 1 }
            );

            if (shouldRevokeUrl) {
              URL.revokeObjectURL(imageBlobUrl);
            }

            if (!isSilent) {
              this.isUserSegmenting = false;
              useEditorStore.getState().setSegmentationProgress({
                status: 'done',
                progress: 100,
                message: 'Background removed successfully!',
              });
            }
            onProgress?.(100, 'Complete!');

            resolve({
              cutoutBlob: blob,
              cutoutUrl: url,
              width,
              height,
            });
          } catch (err) {
            if (!isSilent) {
              this.isUserSegmenting = false;
              useEditorStore.getState().setSegmentationProgress({
                status: 'error',
                progress: 0,
                message: err instanceof Error ? err.message : 'Alpha compositing failed.',
              });
            }
            reject(err);
          }
        },
        reject: (err) => {
          clearTimeout(watchdog);
          if (shouldRevokeUrl) {
            URL.revokeObjectURL(imageBlobUrl);
          }
          if (!isSilent) {
            this.isUserSegmenting = false;
            useEditorStore.getState().setSegmentationProgress({
              status: 'error',
              progress: 0,
              message: err instanceof Error ? err.message : 'Segmentation failed.',
            });
          }
          reject(err);
        },
      });

      // Transfer memory buffer directly to worker with zero latency
      worker.postMessage(
        {
          id,
          type: 'SEGMENT',
          payload: {
            pixelBuffer,
            width: inferenceW,
            height: inferenceH,
            channels: 4,
          },
        },
        [pixelBuffer]
      );
    });
  }
}

export const segmentationClient = new SegmentationClient();

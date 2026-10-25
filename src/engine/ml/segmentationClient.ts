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

class SegmentationClient {
  private worker: Worker | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pendingRequests = new Map<string, { resolve: (val: any) => void; reject: (err: any) => void }>();
  private isInitialized = false;

  private initWorker(): Worker {
    if (this.worker) return this.worker;

    this.worker = new Worker(new URL('./segmentation.worker.ts', import.meta.url), {
      type: 'module',
    });

    this.worker.onmessage = (e: MessageEvent) => {
      const { id, type, payload, error } = e.data;

      if (type === 'MODEL_PROGRESS') {
        const { progress, file } = payload || {};
        const fileName = file ? file.split('/').pop() : 'model weights';
        useEditorStore.getState().setSegmentationProgress({
          status: 'loading_model',
          progress: progress ?? 0,
          message: `Downloading ${fileName} (${progress}%)...`,
        });
        return;
      }

      if (type === 'INFERENCE_START') {
        useEditorStore.getState().setSegmentationProgress({
          status: 'processing',
          progress: 85,
          message: 'Extracting subject mask in browser GPU...',
        });
        return;
      }

      const pending = id ? this.pendingRequests.get(id) : null;
      if (!pending) return;

      this.pendingRequests.delete(id);

      if (type === 'ERROR') {
        pending.reject(new Error(error || 'Worker error'));
      } else if (type === 'SEGMENT_SUCCESS') {
        pending.resolve(payload);
      } else if (type === 'WARMUP_SUCCESS') {
        pending.resolve(true);
      }
    };

    this.worker.onerror = (err) => {
      console.error('Segmentation Worker Fatal Error:', err);
      useEditorStore.getState().setSegmentationProgress({
        status: 'error',
        progress: 0,
        message: 'Worker failed to initialize. Please verify WebGPU / WASM support.',
      });
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

  public async removeBackground(
    imageSource: File | Blob | string,
    onProgress?: ProgressCallback
  ): Promise<SegmentationResult> {
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

    // Load original image to retain high-res dimensions and bitmap
    imgElement = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.src = imageBlobUrl;
    });

    onProgress?.(10, 'Initializing AI neural model...');
    useEditorStore.getState().setSegmentationProgress({
      status: 'loading_model',
      progress: 10,
      message: 'Initializing AI neural model in browser...',
    });

    return new Promise<SegmentationResult>((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve: async (rawResult) => {
          try {
            const { maskBuffer, maskWidth, maskHeight } = rawResult;
            const maskBytes = new Uint8ClampedArray(maskBuffer);

            useEditorStore.getState().setSegmentationProgress({
              status: 'processing',
              progress: 95,
              message: 'Compositing alpha matte & edge feathering...',
            });

            // Composite alpha mask at 100% original natural resolution
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

            useEditorStore.getState().setSegmentationProgress({
              status: 'done',
              progress: 100,
              message: 'Background removed successfully!',
            });

            resolve({
              cutoutBlob: blob,
              cutoutUrl: url,
              width,
              height,
            });
          } catch (err) {
            reject(err);
          }
        },
        reject: (err) => {
          if (shouldRevokeUrl) {
            URL.revokeObjectURL(imageBlobUrl);
          }
          useEditorStore.getState().setSegmentationProgress({
            status: 'error',
            progress: 0,
            message: err instanceof Error ? err.message : 'Segmentation failed.',
          });
          reject(err);
        },
      });

      worker.postMessage({
        id,
        type: 'SEGMENT',
        payload: { imageBlobUrl },
      });
    });
  }
}

export const segmentationClient = new SegmentationClient();

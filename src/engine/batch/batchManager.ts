import JSZip from 'jszip';
import { segmentationClient } from '../ml/segmentationClient.ts';

export interface BatchItem {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
  cutoutBlob?: Blob;
  cutoutUrl?: string;
  width?: number;
  height?: number;
  errorMessage?: string;
}

export class BatchManager {
  private isProcessing = false;

  public async processQueue(
    items: BatchItem[],
    onItemUpdate: (updated: BatchItem) => void
  ): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      for (const item of items) {
        if (item.status === 'done') continue;

        item.status = 'processing';
        item.progress = 10;
        onItemUpdate({ ...item });

        try {
          const result = await segmentationClient.removeBackground(
            item.file,
            (pct) => {
              item.progress = pct;
              onItemUpdate({ ...item });
            },
            { silent: true }
          );

          item.status = 'done';
          item.progress = 100;
          item.cutoutBlob = result.cutoutBlob;
          item.cutoutUrl = result.cutoutUrl;
          item.width = result.width;
          item.height = result.height;
          onItemUpdate({ ...item });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Segmentation failed';
          item.status = 'error';
          item.errorMessage = msg;
          onItemUpdate({ ...item });
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  public async exportAsZip(items: BatchItem[], filename: string = 'everydaycut-batch-export.zip'): Promise<void> {
    const completedItems = items.filter((i) => i.status === 'done' && i.cutoutBlob);
    if (completedItems.length === 0) {
      throw new Error('No completed cutouts to export.');
    }

    const zip = new JSZip();

    for (let i = 0; i < completedItems.length; i++) {
      const item = completedItems[i];
      if (!item.cutoutBlob) continue;
      const cleanName = item.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      zip.file(`${cleanName}_cutout.png`, item.cutoutBlob);
    }

    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
}

export const batchManager = new BatchManager();

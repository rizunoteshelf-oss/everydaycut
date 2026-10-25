import Konva from 'konva';

export interface ExportOptions {
  format: 'png' | 'jpeg';
  quality?: number; // 0 to 1 for jpeg
  fileName?: string;
}

export async function exportCanvasImage(
  stage: Konva.Stage,
  options: ExportOptions
): Promise<void> {
  const { format, quality = 0.95, fileName = 'everydaycut-export' } = options;

  // Temporarily deselect all transformers before rendering screenshot
  const transformers = stage.find('Transformer');
  transformers.forEach((tr) => tr.hide());
  stage.batchDraw();

  try {
    // Generate full-resolution data URL
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataUrl = stage.toDataURL({
      pixelRatio: 2, // 2x super-sampling for ultra crisp export
      mimeType,
      quality,
    });

    // Trigger download
    const link = document.createElement('a');
    link.download = `${fileName}.${format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    // Restore transformers
    transformers.forEach((tr) => tr.show());
    stage.batchDraw();
  }
}

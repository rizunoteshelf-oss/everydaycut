import React, { useRef, useState } from 'react';
import {
  Image as ImageIcon,
  Shield,
  Cpu,
  ArrowLeft,
  ArrowRight,
  Zap,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { segmentationClient } from '../../engine/ml/segmentationClient.ts';
import { useEditorStore } from '../../engine/state/editorStore.ts';
import { Layer, ToolPresetId } from '../../engine/state/types.ts';
import { processSignatureToMonochrome } from '../../engine/ml/signatureFilter.ts';
import { getSEOEntryByPreset, getPresetBySlug } from '../../seo/seoData.ts';
import { STUDIO_TOOLS, getToolByPreset } from '../../config/toolCatalog.ts';

// Fast direct image loader with EXIF orientation normalization
const loadImageElement = async (
  fileOrUrl: File | string
): Promise<{ src: string; width: number; height: number }> => {
  if (typeof fileOrUrl !== 'string' && typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(fileOrUrl, { imageOrientation: 'from-image' });
      const canvas = document.createElement('canvas');
      canvas.width = bmp.width;
      canvas.height = bmp.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(bmp, 0, 0);
        bmp.close();
        return {
          src: canvas.toDataURL('image/png'),
          width: canvas.width,
          height: canvas.height,
        };
      }
    } catch (e) {
      console.warn('createImageBitmap EXIF fallback:', e);
    }
  }

  let url: string;
  let isObjectUrl = false;
  if (typeof fileOrUrl === 'string') {
    url = fileOrUrl;
  } else {
    url = URL.createObjectURL(fileOrUrl);
    isObjectUrl = true;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      resolve({
        src: url,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      });
    };
    img.onerror = () => {
      if (isObjectUrl) URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image file.'));
    };
    img.src = url;
  });
};

// Curated royalty-free samples (Local zero-latency assets)
const SAMPLE_IMAGES = [
  {
    name: 'Portrait Model',
    url: '/samples/portrait.jpg',
    thumb: '/samples/portrait.jpg',
    preset: 'cutout' as ToolPresetId,
  },
  {
    name: 'Sneakers',
    url: '/samples/sneakers.jpg',
    thumb: '/samples/sneakers.jpg',
    preset: 'amazon' as ToolPresetId,
  },
  {
    name: 'Luxury Watch',
    url: '/samples/watch.jpg',
    thumb: '/samples/watch.jpg',
    preset: 'shopify' as ToolPresetId,
  },
  {
    name: 'Sports Car',
    url: '/samples/car.jpg',
    thumb: '/samples/car.jpg',
    preset: 'studio_shadow' as ToolPresetId,
  },
  {
    name: 'Ink Signature',
    url: '/samples/signature.jpg',
    thumb: '/samples/signature.jpg',
    preset: 'pan_signature' as ToolPresetId,
  },
];

interface DropzoneProps {
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenAbout?: () => void;
  onOpenBatch?: () => void;
  onSelectTool?: (presetId: ToolPresetId) => void;
  onBackHome?: () => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onOpenAbout,
  onOpenBatch,
  onSelectTool,
  onBackHome,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingPresetRef = useRef<ToolPresetId | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { addLayer, applyToolPreset, addTextLayer, setActivePreset: setStorePreset, activePreset } = useEditorStore();

  const handleLaunchTool = (toolId: ToolPresetId) => {
    pendingPresetRef.current = toolId;
    setStorePreset(toolId);

    if (toolId === 'batch') {
      if (onOpenBatch) onOpenBatch();
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleProcessImage = async (
    fileOrUrl: File | string,
    presetId: ToolPresetId = activePreset || 'cutout'
  ) => {
    // If Batch tool selected, open Batch Studio directly
    if (presetId === 'batch') {
      if (onOpenBatch) onOpenBatch();
      return;
    }

    setIsProcessing(true);
    useEditorStore.getState().setSegmentationProgress({ status: 'idle', progress: 0, message: '' });
    try {
      const normalizedOriginal = await loadImageElement(fileOrUrl);
      useEditorStore.getState().setOriginalImageSrc(normalizedOriginal.src);

      // 1. Specialized handling for Signature Cropping (Monochrome high-contrast ink filter)
      if (presetId === 'pan_signature') {
        let srcUrl: string;
        const isCreatedUrl = typeof fileOrUrl !== 'string';
        if (typeof fileOrUrl === 'string') {
          srcUrl = fileOrUrl;
        } else {
          srcUrl = URL.createObjectURL(fileOrUrl);
        }

        const filtered = await processSignatureToMonochrome(srcUrl);
        if (isCreatedUrl) {
          URL.revokeObjectURL(srcUrl);
        }

        const fitScale = Math.min(400 / filtered.width, 200 / filtered.height) * 0.85;
        const sigW = filtered.width * fitScale;
        const sigH = filtered.height * fitScale;
        const sigX = (400 - sigW) / 2;
        const sigY = (200 - sigH) / 2;

        const newLayer: Layer = {
          id: `layer_${Date.now()}`,
          type: 'image',
          name: 'Cleaned Signature',
          src: filtered.dataUrl,
          originalWidth: filtered.width,
          originalHeight: filtered.height,
          x: sigX,
          y: sigY,
          width: sigW,
          height: sigH,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          visible: true,
          shadow: {
            type: 'none',
            color: '#000000',
            blur: 0,
            x: 0,
            y: 0,
            opacity: 0,
          },
          filters: {
            brightness: 0,
            contrast: 15,
            saturation: -100,
            blur: 0,
          },
        };

        addLayer(newLayer);
        applyToolPreset('pan_signature');
        return;
      }

      // 2. Specialized Dual-Layer Portrait Bokeh Engine
      if (presetId === 'blur_bokeh') {
        const origImg = await loadImageElement(fileOrUrl);
        let cutoutUrl = origImg.src;
        let cutW = origImg.width;
        let cutH = origImg.height;

        try {
          const segResult = await segmentationClient.removeBackground(fileOrUrl);
          cutoutUrl = segResult.cutoutUrl;
          cutW = segResult.width;
          cutH = segResult.height;
        } catch (segErr) {
          console.warn('AI Cutout fallback for bokeh:', segErr);
          useEditorStore.getState().setSegmentationProgress({ status: 'idle', progress: 0, message: '' });
        }

        const now = Date.now();
        const bgLayerId = `layer_bokeh_bg_${now}`;
        const fgLayerId = `layer_bokeh_fg_${now + 1}`;

        const bgLayer: Layer = {
          id: bgLayerId,
          type: 'image',
          name: 'Background Photo (Blur Control)',
          src: origImg.src,
          originalWidth: origImg.width,
          originalHeight: origImg.height,
          x: 0,
          y: 0,
          width: origImg.width,
          height: origImg.height,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          visible: true,
          shadow: { type: 'none', color: '#000000', blur: 0, x: 0, y: 0, opacity: 0 },
          filters: { brightness: 0, contrast: 0, saturation: 0, blur: 14 },
        };

        const fgLayer: Layer = {
          id: fgLayerId,
          type: 'image',
          name: 'Foreground Subject (Pin-Sharp)',
          src: cutoutUrl,
          originalWidth: cutW,
          originalHeight: cutH,
          x: 0,
          y: 0,
          width: cutW,
          height: cutH,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          visible: true,
          shadow: { type: 'none', color: '#000000', blur: 0, x: 0, y: 0, opacity: 0 },
          filters: { brightness: 0, contrast: 0, saturation: 0, blur: 0 },
        };

        addLayer(bgLayer);
        addLayer(fgLayer);
        useEditorStore.getState().setActiveLayerId(bgLayerId);
        applyToolPreset('blur_bokeh');
        return;
      }

      // 3. Specialized Instagram Story 9:16 Dual-Layer Composition
      if (presetId === 'instagram_story') {
        const img = await loadImageElement(fileOrUrl);
        const targetW = 1080;
        const targetH = 1920;

        const coverScale = Math.max(targetW / img.width, targetH / img.height);
        const coverW = img.width * coverScale;
        const coverH = img.height * coverScale;

        const containScale = Math.min(targetW / img.width, targetH / img.height) * 0.88;
        const containW = img.width * containScale;
        const containH = img.height * containScale;

        const now = Date.now();
        const bgLayerId = `layer_story_bg_${now}`;
        const fgLayerId = `layer_story_fg_${now + 1}`;

        const bgLayer: Layer = {
          id: bgLayerId,
          type: 'image',
          name: 'Story Blurred Backdrop',
          src: img.src,
          originalWidth: img.width,
          originalHeight: img.height,
          x: (targetW - coverW) / 2,
          y: (targetH - coverH) / 2,
          width: coverW,
          height: coverH,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          visible: true,
          shadow: { type: 'none', color: '#000000', blur: 0, x: 0, y: 0, opacity: 0 },
          filters: { brightness: -10, contrast: 0, saturation: 0, blur: 24 },
        };

        const fgLayer: Layer = {
          id: fgLayerId,
          type: 'image',
          name: 'Story Sharp Subject',
          src: img.src,
          originalWidth: img.width,
          originalHeight: img.height,
          x: (targetW - containW) / 2,
          y: (targetH - containH) / 2,
          width: containW,
          height: containH,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          visible: true,
          shadow: { type: 'soft_shadow', color: '#000000', blur: 30, x: 0, y: 15, opacity: 0.4 },
          filters: { brightness: 0, contrast: 0, saturation: 0, blur: 0 },
        };

        addLayer(bgLayer);
        addLayer(fgLayer);
        useEditorStore.getState().setActiveLayerId(fgLayerId);
        applyToolPreset('instagram_story');
        return;
      }

      // 4. Specialized Indian PAN & Passport Document Auto-White Cutout
      if (presetId === 'pan_photo' || presetId === 'passport') {
        const isPan = presetId === 'pan_photo';
        const targetDim = isPan ? 213 : 600;
        const scaleFactor = isPan ? 0.95 : 0.88;
        const autoCutout = useEditorStore.getState().autoCutoutDocument;

        let srcUrl: string;
        let imgW: number;
        let imgH: number;

        if (autoCutout) {
          try {
            const segResult = await segmentationClient.removeBackground(fileOrUrl);
            srcUrl = segResult.cutoutUrl;
            imgW = segResult.width;
            imgH = segResult.height;
          } catch (e) {
            console.warn('Document auto-cutout fallback to original:', e);
            useEditorStore.getState().setSegmentationProgress({ status: 'idle', progress: 0, message: '' });
            const raw = await loadImageElement(fileOrUrl);
            srcUrl = raw.src;
            imgW = raw.width;
            imgH = raw.height;
          }
        } else {
          const raw = await loadImageElement(fileOrUrl);
          srcUrl = raw.src;
          imgW = raw.width;
          imgH = raw.height;
        }

        const scaleRatio = Math.min(targetDim / imgW, targetDim / imgH) * scaleFactor;
        const layerW = imgW * scaleRatio;
        const layerH = imgH * scaleRatio;
        const layerX = (targetDim - layerW) / 2;
        const layerY = (targetDim - layerH) / 2;

        const docLayer: Layer = {
          id: `layer_doc_${Date.now()}`,
          type: 'image',
          name: isPan ? 'PAN Photo (213×213 UTIITSL/NSDL)' : 'Passport Photo (600×600 Biometric)',
          src: srcUrl,
          originalWidth: imgW,
          originalHeight: imgH,
          x: layerX,
          y: layerY,
          width: layerW,
          height: layerH,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          visible: true,
          shadow: { type: 'none', color: '#000000', blur: 0, x: 0, y: 0, opacity: 0 },
          filters: { brightness: 0, contrast: 0, saturation: 0, blur: 0 },
        };

        addLayer(docLayer);
        applyToolPreset(presetId);
        return;
      }

      // 5. Instant In-RAM Processing (Zero AI network download, <50ms instant execution)
      const instantPresets: ToolPresetId[] = [
        'crop',
        'eraser',
        'upscale',
        'converter',
        'youtube_thumb',
        'pinterest',
        'badges',
      ];

      if (instantPresets.includes(presetId)) {
        const img = await loadImageElement(fileOrUrl);

        let targetCanvasW = img.width;
        let targetCanvasH = img.height;
        let scaleRatio = 1;

        if (presetId === 'crop') {
          targetCanvasW = img.width;
          targetCanvasH = img.height;
          scaleRatio = 1;
        } else if (presetId === 'youtube_thumb') {
          targetCanvasW = 1920;
          targetCanvasH = 1080;
          scaleRatio = Math.min(1920 / img.width, 1080 / img.height);
        } else if (presetId === 'pinterest') {
          targetCanvasW = 1000;
          targetCanvasH = 1500;
          scaleRatio = Math.min(1000 / img.width, 1500 / img.height);
        } else if (presetId === 'badges') {
          targetCanvasW = 1080;
          targetCanvasH = 1080;
          scaleRatio = Math.min(1080 / img.width, 1080 / img.height) * 0.85;
        }

        const layerW = img.width * scaleRatio;
        const layerH = img.height * scaleRatio;
        const layerX = (targetCanvasW - layerW) / 2;
        const layerY = (targetCanvasH - layerH) / 2;

        const newLayer: Layer = {
          id: `layer_${Date.now()}`,
          type: 'image',
          name: 'Uploaded Photo',
          src: img.src,
          originalWidth: img.width,
          originalHeight: img.height,
          x: layerX,
          y: layerY,
          width: layerW,
          height: layerH,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          visible: true,
          shadow: {
            type: 'none',
            color: '#000000',
            blur: 0,
            x: 0,
            y: 0,
            opacity: 0,
          },
          filters: {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            blur: 0,
          },
        };

        addLayer(newLayer);
        applyToolPreset(presetId);

        if (presetId === 'badges') {
          addTextLayer({ text: '50% OFF', badgeStyle: 'pill', badgeColor: '#ef4444' });
        }
        return;
      }

      // 3. AI Cutout Segmentation for E-Commerce & Background Removal Tools
      // (cutout, amazon, shopify, etsy, pfp_maker, blur_bokeh, studio_shadow)
      let cutoutUrl: string;
      let imgWidth: number;
      let imgHeight: number;

      try {
        const segResult = await segmentationClient.removeBackground(fileOrUrl);
        cutoutUrl = segResult.cutoutUrl;
        imgWidth = segResult.width;
        imgHeight = segResult.height;
      } catch (segErr) {
        console.warn('AI Cutout skipped or timed out, loading original photo directly:', segErr);
        useEditorStore.getState().setSegmentationProgress({ status: 'idle', progress: 0, message: '' });
        const fallback = await loadImageElement(fileOrUrl);
        cutoutUrl = fallback.src;
        imgWidth = fallback.width;
        imgHeight = fallback.height;
      }

      let targetCanvasW = imgWidth;
      let targetCanvasH = imgHeight;
      let scaleRatio = 1;

      if (
        presetId === 'amazon' ||
        presetId === 'shopify' ||
        presetId === 'pfp_maker' ||
        presetId === 'etsy'
      ) {
        targetCanvasW = 1080;
        targetCanvasH = 1080;
        scaleRatio = Math.min(1080 / imgWidth, 1080 / imgHeight) * 0.85;
      }

      const layerW = imgWidth * scaleRatio;
      const layerH = imgHeight * scaleRatio;
      const layerX = (targetCanvasW - layerW) / 2;
      const layerY = (targetCanvasH - layerH) / 2;

      const newLayer: Layer = {
        id: `layer_${Date.now()}`,
        type: 'image',
        name: 'Isolated Subject',
        src: cutoutUrl,
        originalWidth: imgWidth,
        originalHeight: imgHeight,
        x: layerX,
        y: layerY,
        width: layerW,
        height: layerH,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        visible: true,
        shadow: {
          type: presetId === 'shopify' || presetId === 'studio_shadow' ? 'soft_shadow' : 'none',
          color: '#000000',
          blur: 20,
          x: 0,
          y: 12,
          opacity: 0.35,
        },
        filters: {
          brightness: 0,
          contrast: 0,
          saturation: 0,
          blur: 0,
        },
      };

      addLayer(newLayer);
      applyToolPreset(presetId);
    } catch (err) {
      console.error('Failed to process image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetPreset = pendingPresetRef.current || activePreset || 'cutout';
    pendingPresetRef.current = null;
    if (file) {
      handleProcessImage(file, targetPreset);
    }
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    const targetPreset = pendingPresetRef.current || activePreset || 'cutout';
    pendingPresetRef.current = null;
    if (file && file.type.startsWith('image/')) {
      handleProcessImage(file, targetPreset);
    }
  };

  const activeToolId: ToolPresetId = activePreset || 'cutout';
  const selectedTool = getToolByPreset(activeToolId) || STUDIO_TOOLS[0];
  const toolSeo = getSEOEntryByPreset(activeToolId);

  const handleRelatedClick = (e: React.MouseEvent, slug: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const preset = getPresetBySlug(slug);
    if (preset && onSelectTool) {
      e.preventDefault();
      onSelectTool(preset);
    }
  };

  return (
    <div className="flex-1 w-full min-w-0 flex flex-col items-center justify-start py-8 px-4 sm:px-6 bg-stage">
      {/* Hidden Global Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        style={{
          position: 'fixed',
          top: -10000,
          left: -10000,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
        onChange={onFileSelected}
      />

      {/* Top Breadcrumb Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-3 mb-6">
        <a
          href="/"
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            if (onBackHome) {
              e.preventDefault();
              onBackHome();
            }
          }}
          className="inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-xl bg-panel border border-borderDark text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-brand-500 hover:text-slate-900 dark:hover:text-white transition-all shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-brand-500" />
          <span>Back to All {STUDIO_TOOLS.length} Tools</span>
        </a>

        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${selectedTool.pillColor}`}>
          {selectedTool.categoryLabel} &bull; {selectedTool.specPill}
        </span>
      </div>

      {/* Focused Tool Heading */}
      <div className="text-center max-w-3xl mb-7">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          {toolSeo.h1}
        </h1>
        <h2 className="text-xs sm:text-base font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
          {toolSeo.h2}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-2.5 max-w-2xl mx-auto leading-relaxed">
          {toolSeo.metaDescription}
        </p>
      </div>

      {/* Focused Tool Dropzone Box */}
      <div
        onMouseEnter={() => segmentationClient.warmup()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={(e) => {
          e.stopPropagation();
          handleLaunchTool(activeToolId);
        }}
        className={`w-full max-w-2xl p-8 sm:p-10 border-2 border-dashed rounded-3xl flex flex-col items-center text-center cursor-pointer transition-all duration-300 shadow-sm ${
          isDragging
            ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
            : 'border-zinc-300 dark:border-zinc-700/80 bg-panel hover:border-brand-500/80 hover:shadow-md'
        }`}
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50 dark:bg-zinc-800/80 border border-emerald-200 dark:border-zinc-700/60 flex items-center justify-center text-brand-500 mb-4 shadow-md transition-transform hover:scale-105">
          <selectedTool.icon className="w-8 h-8 sm:w-10 sm:h-10 text-brand-500" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border mb-2 uppercase tracking-wide bg-brand-500/10 text-brand-700 dark:text-brand-400 border-brand-500/30">
          <span>{selectedTool.specPill}</span>
        </div>

        <h3 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {selectedTool.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-lg mb-6 leading-relaxed">
          {selectedTool.description}
        </p>

        <button
          type="button"
          disabled={isProcessing}
          onClick={(e) => {
            e.stopPropagation();
            handleLaunchTool(activeToolId);
          }}
          className="min-h-[44px] px-6 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-black font-semibold text-sm transition-all shadow-lg hover:shadow-brand-500/25 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {activeToolId === 'batch' ? <Layers className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
          <span>
            {isProcessing
              ? 'Processing in RAM...'
              : activeToolId === 'batch'
                ? 'Open Batch ZIP Studio'
                : 'Choose Photo or Drag & Drop'}
          </span>
        </button>

        {/* Security & Speed Verification Badges */}
        <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-6 mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-[11px] sm:text-[12px] text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-brand-500" />
            <span>100% In-Browser RAM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-brand-500" />
            <span>No Server Uploads</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-brand-500" />
            <span>Unlimited Free HD</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
            <span>Zero Watermarks</span>
          </div>
        </div>
      </div>

      {/* Quick Sample Selector */}
      <div className="mt-8 text-center max-w-2xl w-full">
        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-3">
          Or test {selectedTool.shortLabel} instantly with a sample
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {SAMPLE_IMAGES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const targetPreset = pendingPresetRef.current || activeToolId;
                handleProcessImage(sample.url, targetPreset);
              }}
              className="group relative rounded-xl overflow-hidden border border-borderDark hover:border-brand-500 transition-all p-1.5 bg-panel flex flex-col items-center shadow-sm hover:shadow cursor-pointer"
            >
              <img
                src={sample.thumb}
                alt={sample.name}
                className="w-full h-20 object-cover rounded-lg group-hover:scale-105 transition-transform"
              />
              <span className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 mt-2 truncate w-full">
                {sample.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Visible Tool Specifications, How-To Steps & FAQs (SEO & AdSense Value Content) */}
      <div className="mt-14 max-w-4xl w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="p-6 rounded-2xl bg-panel border border-borderDark shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              How to Use {selectedTool.title}
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              {toolSeo.howToSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </section>

          <section className="p-6 rounded-2xl bg-panel border border-borderDark shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Technical Specifications
            </h3>
            <dl className="space-y-2.5 text-xs">
              {Object.entries(toolSeo.specs).map(([key, val]) => (
                <div key={key} className="border-b border-borderDark/60 pb-2 last:border-b-0 last:pb-0">
                  <dt className="font-bold text-slate-800 dark:text-zinc-200">{key}</dt>
                  <dd className="text-slate-600 dark:text-zinc-400 mt-0.5">{val}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {/* Frequently Asked Questions */}
        <section className="p-6 rounded-2xl bg-panel border border-borderDark shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toolSeo.faqs.map((faq, idx) => (
              <article key={idx} className="p-4 rounded-xl bg-stage border border-borderDark/80 space-y-1.5">
                <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {faq.question}
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Related Tools & EverydayPDF Cross-Links */}
        <section className="p-5 rounded-2xl bg-panel border border-borderDark shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-zinc-200 block">
              Related Studio Tools
            </span>
            <div className="flex flex-wrap gap-2">
              {toolSeo.relatedTools.map((rel) => (
                <a
                  key={rel.slug}
                  href={`/${rel.slug}`}
                  onClick={(e) => handleRelatedClick(e, rel.slug)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stage border border-borderDark text-emerald-700 dark:text-emerald-400 font-semibold hover:border-brand-500 transition-colors"
                >
                  <span>{rel.name}</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>

          <a
            href="https://everydaypdf.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline shrink-0"
          >
            Need PDF tools? 52+ free at EverydayPDF.me →
          </a>
        </section>
      </div>

      {/* Semantic Legal Footer (44px+ Accessible Touch Targets) */}
      <footer className="mt-12 w-full max-w-5xl border-t border-borderDark pt-6 pb-4 flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-zinc-400 flex-wrap">
        <button
          type="button"
          onClick={onOpenAbout}
          className="min-h-[44px] py-2 px-3 flex items-center hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          About EverydayCut
        </button>
        <span>&bull;</span>
        <button
          type="button"
          onClick={onOpenPrivacy}
          className="min-h-[44px] py-2 px-3 flex items-center hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          Privacy Policy (100% In-Browser)
        </button>
        <span>&bull;</span>
        <button
          type="button"
          onClick={onOpenTerms}
          className="min-h-[44px] py-2 px-3 flex items-center hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          Terms of Service
        </button>
        <span>&bull;</span>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('everydaycut:open-cookie-settings'))}
          className="min-h-[44px] py-2 px-3 flex items-center hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          Privacy &amp; Cookie Settings
        </button>
      </footer>
    </div>
  );
};

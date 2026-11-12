import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  Shield,
  Cpu,
  Layers,
  Eraser,
  Wand2,
  Palette,
  ArrowRight,
  Zap,
  CheckCircle2,
  ShoppingBag,
  ShoppingCart,
  UserCheck,
  Instagram,
  Youtube,
  FileText,
  PenTool,
  Sliders,
  Compass,
  FileCheck,
  Award,
  Crop,
  ChevronDown,
} from 'lucide-react';
import { segmentationClient } from '../../engine/ml/segmentationClient.ts';
import { useEditorStore } from '../../engine/state/editorStore.ts';
import { Layer, ToolPresetId } from '../../engine/state/types.ts';
import { processSignatureToMonochrome } from '../../engine/ml/signatureFilter.ts';
import { getSEOEntryByPreset } from '../../seo/seoData.ts';

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

type StudioCategory = 'all' | 'ecommerce' | 'social' | 'documents' | 'utilities';

interface StudioToolDefinition {
  id: ToolPresetId;
  title: string;
  category: StudioCategory;
  specPill: string;
  pillColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  actionText: string;
  isSpecial?: boolean;
}

const STUDIO_TOOLS: StudioToolDefinition[] = [
  // 1. Government & Official ID Tools
  {
    id: 'pan_photo',
    title: 'PAN Card Photo Cropper',
    category: 'documents',
    specPill: '213×213 px • <30 KB',
    pillColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    icon: UserCheck,
    description: 'UTIITSL & NSDL compliant. Exact 213x213 px 300 DPI crop with biometric face alignment and guaranteed < 30 KB JPEG compression.',
    actionText: 'Crop PAN Photo',
    isSpecial: true,
  },
  {
    id: 'pan_signature',
    title: 'PAN Card Signature Cropper',
    category: 'documents',
    specPill: '400×200 px • <20 KB',
    pillColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    icon: PenTool,
    description: 'UTIITSL & NSDL signature tool. Automatic high-contrast ink thresholding (filters paper shadows/tint) with guaranteed < 20 KB export.',
    actionText: 'Crop Signature',
    isSpecial: true,
  },
  {
    id: 'passport',
    title: 'Passport & Visa Photo Maker',
    category: 'documents',
    specPill: '2×2 inch (600×600 px)',
    pillColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    icon: FileCheck,
    description: 'Standard passport & visa dimensions with 70-80% crown-to-chin guideline overlay and crisp white background replacement.',
    actionText: 'Make Passport Photo',
  },

  // 2. E-Commerce & Marketplace Tools
  {
    id: 'amazon',
    title: 'Amazon Product Stager',
    category: 'ecommerce',
    specPill: '1:1 Square • 85% Rule',
    pillColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    icon: ShoppingCart,
    description: 'Compliant Amazon listing creator: pure #FFFFFF background, 1:1 square canvas, and official 85% product bounding box overlay.',
    actionText: 'Stage for Amazon',
  },
  {
    id: 'shopify',
    title: 'Shopify Hero Studio',
    category: 'ecommerce',
    specPill: 'Pedestal & Soft Shadow',
    pillColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    icon: ShoppingBag,
    description: 'High-converting product showcase with soft contact shadows, pastel studio backdrops, and balanced framing for modern storefronts.',
    actionText: 'Stage for Shopify',
  },
  {
    id: 'badges',
    title: 'E-Commerce Marketing Badges',
    category: 'ecommerce',
    specPill: '50% OFF • Star Ratings',
    pillColor: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    icon: Award,
    description: 'Stamp promotional badges (BESTSELLER, 50% OFF, FREE SHIPPING, 5-Star Badges) with custom fonts and colors directly onto listings.',
    actionText: 'Add Sales Badges',
  },
  {
    id: 'etsy',
    title: 'Etsy & eBay Clean Stager',
    category: 'ecommerce',
    specPill: 'Clean Shadow • HD',
    pillColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
    icon: Sparkles,
    description: 'Natural aesthetic lighting with subtle floating shadows to showcase handmade crafts, apparel, and collectibles.',
    actionText: 'Stage for Etsy/eBay',
  },

  // 3. Social Media & Creator Studio
  {
    id: 'pfp_maker',
    title: 'Profile Picture (PFP) Maker',
    category: 'social',
    specPill: 'Circle Mask & Glow',
    pillColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    icon: UserCheck,
    description: 'Create eye-catching avatars with circular crop guide, vibrant gradient rings, and high-contrast color palettes for LinkedIn, X & YouTube.',
    actionText: 'Create Profile PFP',
  },
  {
    id: 'instagram_story',
    title: 'Instagram Story & Reel Resizer',
    category: 'social',
    specPill: '9:16 Vertical (1080×1920)',
    pillColor: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30',
    icon: Instagram,
    description: 'Instant 9:16 vertical composition with smart background color matching or blurred photo backdrops for TikTok, Reels, and Stories.',
    actionText: 'Create 9:16 Story',
  },
  {
    id: 'youtube_thumb',
    title: 'YouTube Thumbnail Pop-Out',
    category: 'social',
    specPill: '16:9 Landscape (1920×1080)',
    pillColor: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    icon: Youtube,
    description: '16:9 landscape canvas with high-vibrance saturation boost, bold contrast, and crisp cutout placement for high CTR thumbnails.',
    actionText: 'Create Thumbnail',
  },
  {
    id: 'pinterest',
    title: 'Pinterest Pin Optimizer',
    category: 'social',
    specPill: '2:3 Vertical (1000×1500)',
    pillColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    icon: Compass,
    description: 'Optimized 2:3 vertical canvas with top and bottom typographic banner zones for recipes, fashion, and home decor pins.',
    actionText: 'Create Pinterest Pin',
  },

  // 4. AI Cutout & Photo Utilities
  {
    id: 'crop',
    title: 'Crop & Aspect Ratio Studio',
    category: 'utilities',
    specPill: '1:1 • 4:5 • 9:16 • 16:9 • Custom',
    pillColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    icon: Crop,
    description: 'Crop and frame photos to standard social & marketplace ratios with zero compression loss and sub-pixel canvas controls.',
    actionText: 'Crop Image',
    isSpecial: true,
  },
  {
    id: 'cutout',
    title: 'AI Background Removal',
    category: 'utilities',
    specPill: 'Neural RMBG-1.4 • Alpha',
    pillColor: 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30',
    icon: UploadCloud,
    description: 'Sub-pixel subject extraction using in-browser neural networks. Generates clean transparent PNG cutouts in seconds with zero cloud uploads.',
    actionText: 'Remove Background',
  },
  {
    id: 'eraser',
    title: 'Magic Eraser (Inpainting)',
    category: 'utilities',
    specPill: 'Texture Diffusion',
    pillColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    icon: Eraser,
    description: 'Brush over unwanted people, objects, text, or photo blemishes to cleanly synthesize and fill background texture directly in your browser.',
    actionText: 'Launch Magic Eraser',
  },
  {
    id: 'upscale',
    title: '2x / 4x Super-Resolution',
    category: 'utilities',
    specPill: 'Edge-Preserving 4K',
    pillColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    icon: Wand2,
    description: 'Sharpen low-resolution product photos up to 4K resolution using high-precision bicubic unsharp masking in browser memory.',
    actionText: 'Upscale Image',
  },
  {
    id: 'batch',
    title: 'Batch Cutout Studio (.ZIP)',
    category: 'utilities',
    specPill: 'Bulk Parallel Processing',
    pillColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30',
    icon: Layers,
    description: 'Drop dozens of catalog photos at once. Process each cutout in parallel across browser Web Workers and download as a single .ZIP file.',
    actionText: 'Open Batch Studio',
  },
  {
    id: 'blur_bokeh',
    title: 'Bokeh / Background Blur',
    category: 'utilities',
    specPill: 'DSLR Depth of Field',
    pillColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
    icon: Sliders,
    description: 'Simulate high-end DSLR shallow depth of field by keeping your isolated product pin-sharp while applying smooth bokeh blur to the scene.',
    actionText: 'Apply Bokeh Blur',
  },
  {
    id: 'studio_shadow',
    title: 'Studio Shadows & Lighting',
    category: 'utilities',
    specPill: 'Contact & Floating Drop',
    pillColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    icon: Palette,
    description: 'Synthesize grounded contact shadows, soft ambient ground glows, or floating drop shadows with full control over blur, angle, and opacity.',
    actionText: 'Add Studio Shadow',
  },
  {
    id: 'converter',
    title: 'Smart Format & Size Compressor',
    category: 'utilities',
    specPill: 'PNG • JPEG • WEBP • KB Budget',
    pillColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    icon: FileText,
    description: 'Convert between PNG, JPEG, and WEBP with precision file-size targeting to meet strict upload limits on job and government portals.',
    actionText: 'Compress & Convert',
  },
];

interface DropzoneProps {
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenAbout?: () => void;
  onOpenBatch?: () => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onOpenAbout,
  onOpenBatch,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingPresetRef = useRef<ToolPresetId>('cutout');
  const [isDragging, setIsDragging] = useState(false);
  const [activeCategory, setActiveCategory] = useState<StudioCategory>('all');
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
    const targetPreset = pendingPresetRef.current || activePreset;
    if (file) {
      handleProcessImage(file, targetPreset);
    }
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    const targetPreset = pendingPresetRef.current || activePreset;
    if (file && file.type.startsWith('image/')) {
      handleProcessImage(file, targetPreset);
    }
  };

  const selectedTool = STUDIO_TOOLS.find((t) => t.id === activePreset) || STUDIO_TOOLS[0];

  const filteredTools =
    activeCategory === 'all'
      ? STUDIO_TOOLS
      : STUDIO_TOOLS.filter((t) => t.category === activeCategory);

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-start py-8 px-4 sm:px-6 bg-stage overflow-y-auto">
      {/* Hidden Global Native File Input (Isolated from parent click bubbling and accessible across all browsers) */}
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

      {/* Studio Header Badge */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>Professional {STUDIO_TOOLS.length}-Tool Creative Studio &bull; 100% Client-Side</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Everything You Need for Pro Photos &amp; Documents
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl mx-auto">
          100% Free &bull; Zero Server Uploads &bull; Processed Securely in Your Browser RAM
        </p>
      </div>

      {/* Interactive Tool Selector Carousel (Browse all 19 tools immediately above the fold) */}
      <div className="w-full max-w-4xl mb-6">
        <div className="flex items-center justify-between px-1 mb-2.5">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Select Any Tool ({STUDIO_TOOLS.length} Available)</span>
          </span>
          <button
            type="button"
            onClick={() => document.getElementById('studio-catalog')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Catalog ↓</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Tool Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
          {STUDIO_TOOLS.map((tool) => {
            const isCurrent = (activePreset || 'cutout') === tool.id;
            const seo = getSEOEntryByPreset(tool.id);
            return (
              <a
                key={tool.id}
                href={`/${seo.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  setStorePreset(tool.id);
                  window.history.pushState(null, '', `/${seo.slug}`);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all shadow-sm cursor-pointer ${
                  isCurrent
                    ? 'bg-brand-500 text-black shadow-md scale-105 ring-2 ring-brand-500/30'
                    : 'bg-panel border border-borderDark text-zinc-700 dark:text-zinc-300 hover:border-brand-500/60 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <tool.icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-black' : 'text-brand-500'}`} />
                <span>{tool.title}</span>
                {tool.isSpecial && (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                    isCurrent ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    Hot
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </div>

      {/* Hero Ingestion Box */}
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
          handleLaunchTool(activePreset || 'cutout');
        }}
        className={`w-full max-w-2xl p-8 sm:p-10 border-2 border-dashed rounded-3xl flex flex-col items-center text-center cursor-pointer transition-all duration-300 shadow-sm ${
          isDragging
            ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
            : 'border-zinc-300 dark:border-zinc-700/80 bg-panel hover:border-brand-500/80 hover:shadow-md'
        }`}
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-brand-500 mb-4 shadow-md transition-transform hover:scale-105">
          <selectedTool.icon className="w-8 h-8 sm:w-10 sm:h-10 text-brand-500" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border mb-2 uppercase tracking-wide bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30">
          <span>{selectedTool.specPill}</span>
        </div>

        <h2 className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          {selectedTool.title}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mb-6 leading-relaxed">
          {selectedTool.description}
        </p>

        <button
          type="button"
          disabled={isProcessing}
          onClick={(e) => {
            e.stopPropagation();
            handleLaunchTool(activePreset || 'cutout');
          }}
          className="px-6 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-black font-semibold text-sm transition-all shadow-lg hover:shadow-brand-500/25 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <ImageIcon className="w-4 h-4" />
          <span>{isProcessing ? 'Processing in RAM...' : 'Choose Photo to Start'}</span>
        </button>

        {/* Security & Speed Verification Badges */}
        <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-6 mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-[11px] sm:text-[12px] text-zinc-500 dark:text-zinc-400">
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
            <span>AdSense Clean</span>
          </div>
        </div>
      </div>

      {/* Quick Sample Selector */}
      <div className="mt-8 text-center max-w-2xl w-full">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-3">
          Or test instantly with a sample photo
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {SAMPLE_IMAGES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                const currentPreset = pendingPresetRef.current || activePreset;
                const targetPreset =
                  currentPreset !== 'cutout'
                    ? currentPreset
                    : sample.preset;
                handleProcessImage(sample.url, targetPreset);
              }}
              className="group relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-brand-500 transition-all p-1.5 bg-panel flex flex-col items-center shadow-sm hover:shadow cursor-pointer"
            >
              <img
                src={sample.thumb}
                alt={sample.name}
                className="w-full h-20 object-cover rounded-lg group-hover:scale-105 transition-transform"
              />
              <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mt-2 truncate w-full">
                {sample.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Studio Hub Catalog */}
      <div id="studio-catalog" className="mt-14 max-w-5xl w-full scroll-mt-6">
        <div className="text-center mb-6">
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest block mb-1">
            Complete Studio Catalog
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
            {STUDIO_TOOLS.length} Professional Tools — All Free, Zero Server Cost
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Select any tool below to load its exact canvas specifications, biometric guides, and compression limits.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-8">
          {[
            { id: 'all', label: `All Tools (${STUDIO_TOOLS.length})` },
            { id: 'documents', label: '🇮🇳 ID & Government (PAN/Passport)' },
            { id: 'ecommerce', label: '🛒 E-Commerce & Marketplaces' },
            { id: 'social', label: '📱 Social & Creator Studio' },
            { id: 'utilities', label: '⚙️ AI Cutout & Utilities' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as StudioCategory)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                activeCategory === cat.id
                  ? 'bg-brand-500 text-black shadow-md'
                  : 'bg-panel border border-borderDark text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => {
            const isSelected = activePreset === tool.id;
            const seo = getSEOEntryByPreset(tool.id);
            return (
              <a
                key={tool.id}
                href={`/${seo.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLaunchTool(tool.id);
                  window.history.pushState(null, '', `/${seo.slug}`);
                }}
                className={`p-5 rounded-2xl bg-panel border transition-all cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-md ${
                  isSelected
                    ? 'border-brand-500 ring-2 ring-brand-500/20'
                    : 'border-borderDark hover:border-brand-500/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 group-hover:scale-110 transition-transform">
                      <tool.icon className="w-5 h-5 text-brand-500" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tool.pillColor}`}
                    >
                      {tool.specPill}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                    <span>{tool.title}</span>
                    {tool.isSpecial && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        Popular
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div
                  className="w-full mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all text-left"
                >
                  <span>{tool.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Clean Legal & Compliance Footer for AdSense & EverydayPDF Ecosystem */}
      <div className="mt-14 flex items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400 pb-6 flex-wrap">
        <a
          href="https://everydaypdf.me"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
        >
          Need PDF tools? 52+ free tools at EverydayPDF.me →
        </a>
        <span>&bull;</span>
        <button
          onClick={onOpenAbout}
          className="min-h-[44px] py-2 px-2 flex items-center hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          About EverydayCut
        </button>
        <span>&bull;</span>
        <button
          onClick={onOpenPrivacy}
          className="min-h-[44px] py-2 px-2 flex items-center hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          Privacy Policy (100% In-Browser)
        </button>
        <span>&bull;</span>
        <button
          onClick={onOpenTerms}
          className="min-h-[44px] py-2 px-2 flex items-center hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          Terms of Service
        </button>
      </div>
    </div>
  );
};

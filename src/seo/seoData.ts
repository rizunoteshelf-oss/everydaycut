import { ToolPresetId } from '../engine/state/types.ts';
import { SEO_TOOL_REGISTRY_DATA } from './seoRegistry.js';

export interface ToolSEOEntry {
  presetId: ToolPresetId | null;
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  h2: string;
  keywords: string[];
  howToSteps: string[];
  supportedFormats: string[];
  specs: Record<string, string>;
  useCases: string[];
  faqs: Array<{ question: string; answer: string }>;
  relatedTools: Array<{ name: string; slug: string }>;
  relatedPdfTools?: Array<{ name: string; url: string; reason: string }>;
}

export const HOME_SEO_ENTRY: ToolSEOEntry = {
  presetId: null,
  slug: '',
  title: 'EverydayCut - 100% Free, Unlimited & Private Client-Side Photo & ID Studio',
  metaDescription:
    'Every photo, cutout, and government ID resize tool inside your browser. Free PAN photo cropper (<30 KB), passport photo maker, AI background remover, magic eraser & compressor with zero server uploads.',
  h1: 'Every photo & ID tool you need, 100% inside your browser.',
  h2: 'Zero Server Uploads • 100% Private On-Device WebGPU & WebAssembly Creative Suite',
  keywords: [
    'everydaycut',
    'free photo tools online',
    'pan card photo resizer 213x213',
    'passport photo maker free',
    'client side background remover',
    'magic eraser no sign up',
    'image compressor under 20kb 30kb',
  ],
  howToSteps: [
    'Choose any photo, document ID, e-commerce, or social tool from the studio directory.',
    'Drop or select your image — processing happens strictly inside local browser memory (WebGPU / WebAssembly / HTML5 Canvas).',
    'Adjust dimensions, shadows, backgrounds, or exact KB budgets visually in real time.',
    'Export crisp HD PNG, JPEG, or WebP files with zero watermarks or server uploads.',
  ],
  supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
  specs: {
    'Execution Engine': '100% Client-Side (WebGPU, ONNX WASM SIMD & HTML5 2D Canvas)',
    Privacy: 'Zero Server Uploads — Photos Never Leave Device Memory',
    Cost: '$0 Forever (No Watermarks, Credits, or Sign-Up)',
  },
  useCases: [
    'Formatting PAN Card photos (<30 KB) and signatures (<20 KB) for UTIITSL & NSDL portals',
    'Preparing compliant Amazon (#FFFFFF 85% safe zone) and Shopify product photography',
    'Removing image backgrounds, erasing unwanted objects, and upscaling clarity in-browser',
  ],
  faqs: [
    {
      question: 'Are my photos or ID documents ever uploaded to a server?',
      answer:
        'Never. EverydayCut processes 100% of images directly inside your browser volatile RAM via WebAssembly, WebGPU, and HTML5 Canvas. Zero image bytes leave your device.',
    },
    {
      question: 'Is EverydayCut free for PAN photos, cutouts, and HD exports?',
      answer:
        'Yes. All tools, 300 DPI portal exports, batch ZIP processing, and full-resolution PNG/JPEG/WebP downloads are 100% free with no watermarks or accounts required.',
    },
    {
      question: 'How does EverydayCut complement EverydayPDF?',
      answer:
        'EverydayPDF (everydaypdf.me) handles client-side PDF merging, splitting, OCR, redaction, and document compression, while EverydayCut (cut.everydaypdf.me) handles photos, cutouts, signatures, and exact portal KB image resizing.',
    },
  ],
  relatedTools: [
    { name: 'PAN Card Photo Resizer', slug: 'pan-card-photo-resizer' },
    { name: 'AI Background Remover', slug: 'background-remover' },
    { name: 'Passport Photo Maker', slug: 'passport-photo-maker' },
    { name: 'Smart Image Compressor', slug: 'image-compressor-converter' },
  ],
  relatedPdfTools: [
    { name: 'EverydayPDF Suite', url: 'https://everydaypdf.me', reason: '52+ free client-side PDF tools' },
  ],
};

export const SEO_TOOL_REGISTRY: Record<ToolPresetId, ToolSEOEntry> =
  SEO_TOOL_REGISTRY_DATA as Record<ToolPresetId, ToolSEOEntry>;

export const getSEOEntryByPreset = (presetId?: ToolPresetId | null): ToolSEOEntry => {
  if (!presetId) return HOME_SEO_ENTRY;
  return SEO_TOOL_REGISTRY[presetId] || HOME_SEO_ENTRY;
};

export const getSEOEntryBySlug = (slug: string): ToolSEOEntry | undefined => {
  const cleanSlug = slug.replace(/^#?\/?|\/+$/g, '').trim();
  if (!cleanSlug) return undefined;
  return Object.values(SEO_TOOL_REGISTRY).find((entry) => entry.slug === cleanSlug);
};

export const getPresetBySlug = (slug: string): ToolPresetId | undefined => {
  const entry = getSEOEntryBySlug(slug);
  return entry ? entry.presetId ?? undefined : undefined;
};

export const getAllSEOEntries = (): ToolSEOEntry[] => {
  return Object.values(SEO_TOOL_REGISTRY);
};

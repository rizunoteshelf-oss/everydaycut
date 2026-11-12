import React from 'react';
import {
  UploadCloud,
  Sparkles,
  Layers,
  Eraser,
  Wand2,
  Palette,
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
} from 'lucide-react';
import { ToolPresetId } from '../engine/state/types.ts';

export type StudioCategory = 'all' | 'documents' | 'ecommerce' | 'social' | 'utilities';

export interface StudioToolDefinition {
  id: ToolPresetId;
  title: string;
  shortLabel: string;
  category: Exclude<StudioCategory, 'all'>;
  categoryLabel: string;
  specPill: string;
  pillColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  actionText: string;
  isFlagship?: boolean;
  badgeText?: string;
}

export const STUDIO_TOOLS: StudioToolDefinition[] = [
  // 1. Government & Official ID Tools (High-Intent Portal Tools)
  {
    id: 'pan_photo',
    title: 'PAN Card Photo Cropper',
    shortLabel: 'PAN Photo',
    category: 'documents',
    categoryLabel: 'ID & Government',
    specPill: '213×213 px • <30 KB',
    pillColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
    icon: UserCheck,
    description:
      'UTIITSL & NSDL compliant. Exact 213×213 px 300 DPI crop with biometric face alignment and guaranteed <30 KB JPEG export.',
    actionText: 'Crop PAN Photo',
    isFlagship: true,
    badgeText: '300 DPI • <30KB',
  },
  {
    id: 'pan_signature',
    title: 'PAN Card Signature Cropper',
    shortLabel: 'PAN Signature',
    category: 'documents',
    categoryLabel: 'ID & Government',
    specPill: '400×200 px • <20 KB',
    pillColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',
    icon: PenTool,
    description:
      'UTIITSL & NSDL signature tool. High-contrast ink thresholding filters paper shadows and exports strictly under 20 KB.',
    actionText: 'Crop Signature',
    isFlagship: true,
    badgeText: 'Portal Ready',
  },
  {
    id: 'passport',
    title: 'Passport & Visa Photo Maker',
    shortLabel: 'Passport Photo',
    category: 'documents',
    categoryLabel: 'ID & Government',
    specPill: '2×2 inch (600×600 px)',
    pillColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30',
    icon: FileCheck,
    description:
      'Standard 600×600 px passport & visa dimensions with 70–80% crown-to-chin guide overlay and crisp #FFFFFF backdrop.',
    actionText: 'Make Passport Photo',
    isFlagship: true,
    badgeText: 'Biometric',
  },

  // 2. E-Commerce & Marketplace Tools
  {
    id: 'amazon',
    title: 'Amazon Product Stager',
    shortLabel: 'Amazon Stager',
    category: 'ecommerce',
    categoryLabel: 'E-Commerce',
    specPill: '1:1 Square • 85% Rule',
    pillColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
    icon: ShoppingCart,
    description:
      'Compliant Amazon main-image creator: pure #FFFFFF background, 1:1 square canvas, and official 85% product bounding box.',
    actionText: 'Stage for Amazon',
    isFlagship: true,
    badgeText: '85% Safe Zone',
  },
  {
    id: 'shopify',
    title: 'Shopify Hero Studio',
    shortLabel: 'Shopify Studio',
    category: 'ecommerce',
    categoryLabel: 'E-Commerce',
    specPill: 'Pedestal & Soft Shadow',
    pillColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
    icon: ShoppingBag,
    description:
      'High-converting product showcase with soft contact shadows, clean studio backdrops, and balanced framing for storefronts.',
    actionText: 'Stage for Shopify',
  },
  {
    id: 'badges',
    title: 'E-Commerce Marketing Badges',
    shortLabel: 'Sales Badges',
    category: 'ecommerce',
    categoryLabel: 'E-Commerce',
    specPill: '50% OFF • Promo Stamps',
    pillColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
    icon: Award,
    description:
      'Stamp promotional badges (BESTSELLER, 50% OFF, FREE SHIPPING) with custom fonts and colors directly onto listings.',
    actionText: 'Add Sales Badges',
  },
  {
    id: 'etsy',
    title: 'Etsy & eBay Clean Stager',
    shortLabel: 'Etsy & eBay',
    category: 'ecommerce',
    categoryLabel: 'E-Commerce',
    specPill: 'Clean Shadow • HD',
    pillColor: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30',
    icon: Sparkles,
    description:
      'Natural studio lighting with subtle floating shadows to showcase handmade crafts, apparel, and collectibles.',
    actionText: 'Stage for Etsy/eBay',
  },

  // 3. Social Media & Creator Studio
  {
    id: 'pfp_maker',
    title: 'Profile Picture (PFP) Maker',
    shortLabel: 'PFP Maker',
    category: 'social',
    categoryLabel: 'Social & Creator',
    specPill: 'Circle Mask & Glow',
    pillColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30',
    icon: UserCheck,
    description:
      'Create eye-catching avatars with a circular crop guide, vibrant gradient rings, and clean cutouts for LinkedIn, X & YouTube.',
    actionText: 'Create Profile PFP',
  },
  {
    id: 'instagram_story',
    title: 'Instagram Story & Reel Resizer',
    shortLabel: '9:16 Story',
    category: 'social',
    categoryLabel: 'Social & Creator',
    specPill: '9:16 Vertical (1080×1920)',
    pillColor: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/30',
    icon: Instagram,
    description:
      'Instant 9:16 vertical composition with smart blurred backdrops for Instagram Stories, Reels, and YouTube Shorts.',
    actionText: 'Create 9:16 Story',
  },
  {
    id: 'youtube_thumb',
    title: 'YouTube Thumbnail Pop-Out',
    shortLabel: 'YT Thumbnail',
    category: 'social',
    categoryLabel: 'Social & Creator',
    specPill: '16:9 Landscape (1920×1080)',
    pillColor: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
    icon: Youtube,
    description:
      '16:9 landscape canvas with bold contrast and crisp subject pop-out framing designed for high-CTR thumbnails.',
    actionText: 'Create Thumbnail',
  },
  {
    id: 'pinterest',
    title: 'Pinterest Pin Optimizer',
    shortLabel: 'Pinterest Pin',
    category: 'social',
    categoryLabel: 'Social & Creator',
    specPill: '2:3 Vertical (1000×1500)',
    pillColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30',
    icon: Compass,
    description:
      'Optimized 2:3 vertical canvas with generous typography framing zones for recipes, fashion, and product pins.',
    actionText: 'Create Pinterest Pin',
  },

  // 4. AI Cutout & Photo Utilities
  {
    id: 'cutout',
    title: 'AI Background Removal',
    shortLabel: 'BG Remover',
    category: 'utilities',
    categoryLabel: 'AI & Utilities',
    specPill: 'Neural RMBG-1.4 • Alpha',
    pillColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/30',
    icon: UploadCloud,
    description:
      'Sub-pixel subject extraction using in-browser neural networks. Generates clean transparent PNG cutouts in RAM with zero uploads.',
    actionText: 'Remove Background',
    isFlagship: true,
    badgeText: 'AI Neural',
  },
  {
    id: 'eraser',
    title: 'Magic Eraser (Inpainting)',
    shortLabel: 'Magic Eraser',
    category: 'utilities',
    categoryLabel: 'AI & Utilities',
    specPill: 'Texture Diffusion',
    pillColor: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30',
    icon: Eraser,
    description:
      'Brush over unwanted people, objects, text, or blemishes to synthesize and fill surrounding background texture cleanly.',
    actionText: 'Launch Magic Eraser',
    isFlagship: true,
    badgeText: 'Inpaint',
  },
  {
    id: 'converter',
    title: 'Smart Format & Size Compressor',
    shortLabel: 'KB Compressor',
    category: 'utilities',
    categoryLabel: 'AI & Utilities',
    specPill: 'PNG • JPEG • WEBP • KB Budget',
    pillColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30',
    icon: FileText,
    description:
      'Convert between PNG, JPEG, and WEBP with exact KB target budgeting to meet strict exam and job portal upload limits.',
    actionText: 'Compress & Convert',
    isFlagship: true,
    badgeText: 'Exact KB',
  },
  {
    id: 'upscale',
    title: 'High-Precision 4K Clarity Upscaler',
    shortLabel: '4K Upscaler',
    category: 'utilities',
    categoryLabel: 'AI & Utilities',
    specPill: 'Bicubic + Unsharp 4K',
    pillColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
    icon: Wand2,
    description:
      'Upscale and sharpen low-resolution photos 2× or 4× using bicubic resampling and unsharp masking in browser memory.',
    actionText: 'Upscale & Sharpen',
    isFlagship: true,
    badgeText: '2× / 4× HD',
  },
  {
    id: 'crop',
    title: 'Crop & Aspect Ratio Studio',
    shortLabel: 'Crop Studio',
    category: 'utilities',
    categoryLabel: 'AI & Utilities',
    specPill: '1:1 • 4:5 • 9:16 • 16:9',
    pillColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
    icon: Crop,
    description:
      'Frame photos to standard social and marketplace ratios with zero compression loss and sub-pixel canvas controls.',
    actionText: 'Crop Image',
  },
  {
    id: 'batch',
    title: 'Batch Cutout Studio (.ZIP)',
    shortLabel: 'Batch Studio',
    category: 'utilities',
    categoryLabel: 'AI & Utilities',
    specPill: 'Bulk Parallel Processing',
    pillColor: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/30',
    icon: Layers,
    description:
      'Drop multiple catalog photos at once. Process cutouts locally in your browser and download everything as a single .ZIP.',
    actionText: 'Open Batch Studio',
  },
  {
    id: 'blur_bokeh',
    title: 'Bokeh / Background Blur',
    shortLabel: 'Bokeh Blur',
    category: 'utilities',
    categoryLabel: 'AI & Utilities',
    specPill: 'DSLR Depth of Field',
    pillColor: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30',
    icon: Sliders,
    description:
      'Simulate shallow depth of field by keeping your subject pin-sharp while applying smooth optical blur to the background.',
    actionText: 'Apply Bokeh Blur',
  },
  {
    id: 'studio_shadow',
    title: 'Studio Shadows & Lighting',
    shortLabel: 'Studio Shadows',
    category: 'utilities',
    categoryLabel: 'AI & Utilities',
    specPill: 'Contact & Floating Drop',
    pillColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
    icon: Palette,
    description:
      'Add realistic grounded contact shadows or floating drop shadows with control over blur, angle, and opacity.',
    actionText: 'Add Studio Shadow',
  },
];

export const FLAGSHIP_TOOLS = STUDIO_TOOLS.filter((tool) => tool.isFlagship);

export const STUDIO_CATEGORIES: { id: StudioCategory; label: string }[] = [
  { id: 'all', label: `All Tools (${STUDIO_TOOLS.length})` },
  { id: 'documents', label: 'ID & Government (PAN / Passport)' },
  { id: 'ecommerce', label: 'E-Commerce & Marketplaces' },
  { id: 'social', label: 'Social & Creator Studio' },
  { id: 'utilities', label: 'AI Cutout & Utilities' },
];

export const getToolByPreset = (presetId?: ToolPresetId | null): StudioToolDefinition | undefined => {
  if (!presetId) return undefined;
  return STUDIO_TOOLS.find((tool) => tool.id === presetId);
};

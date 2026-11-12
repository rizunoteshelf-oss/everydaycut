import { ToolPresetId } from '../engine/state/types.ts';
import { SEO_TOOL_REGISTRY_DATA } from './seoRegistry.js';

export interface ToolSEOEntry {
  presetId: ToolPresetId;
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

export const SEO_TOOL_REGISTRY: Record<ToolPresetId, ToolSEOEntry> =
  SEO_TOOL_REGISTRY_DATA as Record<ToolPresetId, ToolSEOEntry>;

export const getSEOEntryByPreset = (presetId?: ToolPresetId | null): ToolSEOEntry => {
  if (!presetId) return SEO_TOOL_REGISTRY['cutout'];
  return SEO_TOOL_REGISTRY[presetId] || SEO_TOOL_REGISTRY['cutout'];
};

export const getSEOEntryBySlug = (slug: string): ToolSEOEntry | undefined => {
  const cleanSlug = slug.replace(/^#?\/?/, '').trim();
  return Object.values(SEO_TOOL_REGISTRY).find((entry) => entry.slug === cleanSlug);
};

export const getPresetBySlug = (slug: string): ToolPresetId | undefined => {
  const entry = getSEOEntryBySlug(slug);
  return entry ? entry.presetId : undefined;
};

export const getAllSEOEntries = (): ToolSEOEntry[] => {
  return Object.values(SEO_TOOL_REGISTRY);
};

import React, { useState } from 'react';
import Konva from 'konva';
import {
  Palette,
  Layers,
  Sliders,
  Check,
  RotateCw,
  Type,
  Wand2,
  Eraser,
  Sparkles,
  Loader2,
  Trash2,
  Plus,
  X,
  Download,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { useEditorStore } from '../../engine/state/editorStore.ts';
import { AdBannerSlot } from '../ads/AdBannerSlot.tsx';
import { BadgeStyle, ShadowType } from '../../engine/state/types.ts';
import { upscaleImage } from '../../engine/ml/upscaler.ts';
import { exportCanvasImage, ExportFormat } from '../../utils/imageExport.ts';

const PRESET_COLORS = [
  '#ffffff',
  '#000000',
  '#f87171',
  '#fb923c',
  '#facc15',
  '#4ade80',
  '#22d3ee',
  '#60a5fa',
  '#c084fc',
  '#f472b6',
  '#94a3b8',
  '#334155',
];

const PRESET_GRADIENTS = [
  { name: 'Sunset', start: '#f97316', end: '#ec4899', angle: 135 },
  { name: 'Ocean', start: '#06b6d4', end: '#3b82f6', angle: 135 },
  { name: 'Aurora', start: '#22c55e', end: '#06b6d4', angle: 135 },
  { name: 'Cosmic', start: '#3b82f6', end: '#9333ea', angle: 135 },
  { name: 'Pastel', start: '#fbcfe8', end: '#bae6fd', angle: 135 },
  { name: 'Charcoal', start: '#1e293b', end: '#0f172a', angle: 135 },
];

const TEXT_BADGE_PRESETS = [
  { text: '50% OFF', badgeStyle: 'pill' as BadgeStyle, badgeColor: '#ef4444', fill: '#ffffff' },
  { text: 'NEW ARRIVAL', badgeStyle: 'pill' as BadgeStyle, badgeColor: '#22c55e', fill: '#000000' },
  { text: 'BESTSELLER', badgeStyle: 'solid' as BadgeStyle, badgeColor: '#f59e0b', fill: '#000000' },
  { text: 'LIMITED EDITION', badgeStyle: 'outline' as BadgeStyle, badgeColor: '#a855f7', fill: '#a855f7' },
  { text: 'FREE SHIPPING', badgeStyle: 'pill' as BadgeStyle, badgeColor: '#06b6d4', fill: '#ffffff' },
  { text: '$29.99', badgeStyle: 'solid' as BadgeStyle, badgeColor: '#18181b', fill: '#22c55e' },
];

interface SidebarProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenAbout: () => void;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
  onInstallPwa?: () => void;
  isPwaInstallable?: boolean;
  isPwaInstalled?: boolean;
  stageRef?: React.RefObject<Konva.Stage | null>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onOpenAbout,
  isOpenOnMobile,
  onCloseMobile,
  onInstallPwa,
  isPwaInstallable,
  isPwaInstalled,
  stageRef,
}) => {
  const {
    layers,
    activeLayerId,
    backgroundFill,
    setBackgroundFill,
    activeTab,
    setActiveTab,
    setActiveShadow,
    setActiveFilters,
    addTextLayer,
    updateActiveTextConfig,
    removeLayer,
    setEditorMode,
    updateLayer,
    recordSnapshot,
    activePreset,
    guideOverlay,
    setGuideOverlay,
    autoCutoutDocument,
    setAutoCutoutDocument,
  } = useEditorStore();

  const activeLayer = layers.find((l) => l.id === activeLayerId) || layers[0];
  const [gradientAngle, setGradientAngle] = useState(backgroundFill.gradient.angle || 135);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [upscaleStatus, setUpscaleStatus] = useState<string | null>(null);

  // Compressor & Converter state
  const [compressFormat, setCompressFormat] = useState<ExportFormat>('webp');
  const [compressQuality, setCompressQuality] = useState<number>(0.9);
  const [compressMaxKb, setCompressMaxKb] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [lastCompressInfo, setLastCompressInfo] = useState<string | null>(null);

  const handleCompressExport = async () => {
    if (!stageRef?.current) return;
    setIsCompressing(true);
    try {
      const result = await exportCanvasImage(stageRef.current, {
        format: compressFormat,
        quality: compressQuality,
        fileName: `everydaycut-converted-${Date.now()}`,
        targetMaxSizeBytes: compressMaxKb ? compressMaxKb * 1000 : undefined,
      });
      setLastCompressInfo(
        `Exported ${compressFormat.toUpperCase()}: ${(result.sizeBytes / 1000).toFixed(1)} KB (${result.width}×${result.height})`
      );
    } catch (e) {
      console.error('Conversion export failed:', e);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleUpscale = async (factor: 2 | 4) => {
    if (!activeLayer?.src || activeLayer.type === 'text') return;
    setIsUpscaling(true);
    setUpscaleStatus(`Processing ${factor}x 4K Clarity enhancement in browser RAM...`);

    try {
      const img = new Image();
      if (!activeLayer.src.startsWith('blob:')) {
        img.crossOrigin = 'anonymous';
      }
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load layer image for upscaling'));
        img.src = activeLayer.src!;
      });

      recordSnapshot();
      const result = await upscaleImage(img, factor, 0.45);

      // Preserve visual width & height on canvas so the photo framing stays identical,
      // while upgrading internal pixel resolution (originalWidth/originalHeight/src)
      updateLayer(activeLayer.id, {
        src: result.url,
        originalWidth: result.width,
        originalHeight: result.height,
      });

      setUpscaleStatus(`Upscaled to ${result.width}×${result.height} successfully!`);
      setTimeout(() => setUpscaleStatus(null), 3000);
    } catch (err) {
      console.error('Upscale failed:', err);
      setUpscaleStatus('Upscaling failed. Please try again.');
      setTimeout(() => setUpscaleStatus(null), 3000);
    } finally {
      setIsUpscaling(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpenOnMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`bg-panel border-borderDark flex flex-col shrink-0 overflow-y-auto transition-colors duration-200 z-20 ${
          isOpenOnMobile
            ? 'fixed inset-x-0 bottom-0 z-50 max-h-[85vh] w-full border-t rounded-t-2xl shadow-2xl !flex'
            : 'hidden md:flex md:w-80 md:h-full md:border-l md:relative'
        }`}
      >
        {/* Mobile-Only Drag Handle and Header */}
        <div className="md:hidden flex items-center justify-between px-4 pt-3 pb-2 border-b border-borderDark sticky top-0 bg-panel z-30">
          <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-1.5" />
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Studio Controls</span>
          <button
            onClick={onCloseMobile}
            aria-label="Close Studio Controls"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      {/* Active Preset Guideline Banner */}
      {activePreset && (
        <div className="p-3 bg-brand-500/10 border-b border-brand-500/20 text-xs shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-brand-600 dark:text-brand-400">
              {activePreset === 'pan_photo' && '🇮🇳 PAN Photo (213×213 px)'}
              {activePreset === 'pan_signature' && '🇮🇳 PAN Signature (400×200 px)'}
              {activePreset === 'passport' && '🛂 Passport Biometric (600×600 px)'}
              {activePreset === 'amazon' && '🛒 Amazon 85% Safe Zone'}
              {activePreset === 'pfp_maker' && '👤 Profile Picture Circle'}
              {activePreset === 'crop' && '📐 Rule-of-Thirds Grid'}
              {activePreset === 'converter' && '⚡ Compress & Convert Studio'}
              {activePreset === 'blur_bokeh' && '✨ Portrait Depth & Bokeh'}
              {activePreset === 'instagram_story' && '📱 Instagram Story (9:16)'}
              {activePreset === 'youtube_thumb' && '🖼️ YouTube Thumbnail (16:9)'}
            </span>
            {guideOverlay !== 'none' ? (
              <button
                onClick={() => setGuideOverlay('none')}
                className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-600 dark:text-brand-400 font-semibold hover:bg-brand-500/30 transition-colors"
                title="Click to hide guidelines"
              >
                Hide Guides
              </button>
            ) : (
              <button
                onClick={() => {
                  if (activePreset === 'pan_photo') setGuideOverlay('pan_face');
                  else if (activePreset === 'pan_signature') setGuideOverlay('pan_signature');
                  else if (activePreset === 'passport') setGuideOverlay('passport_biometric');
                  else if (activePreset === 'amazon') setGuideOverlay('amazon_margin');
                  else if (activePreset === 'pfp_maker') setGuideOverlay('circle_pfp');
                  else if (activePreset === 'crop') setGuideOverlay('rule_of_thirds');
                }}
                className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                title="Click to show guidelines"
              >
                Show Guides
              </button>
            )}
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-tight">
            {activePreset === 'pan_photo' && 'Align face inside the biometric oval. Export will auto-compress strictly under 30 KB JPEG for UTIITSL/NSDL.'}
            {activePreset === 'pan_signature' && 'Align signature within the margins. Export will auto-compress strictly under 20 KB JPEG.'}
            {activePreset === 'passport' && 'Biometric eye and chin guidelines active. Pure white background.'}
            {activePreset === 'amazon' && 'Product must occupy 85% of image frame on pure #FFFFFF white background.'}
            {activePreset === 'pfp_maker' && 'Center subject within the circular preview.'}
            {activePreset === 'crop' && 'Align visual focal points along the rule-of-thirds grid lines for cinematic balance.'}
            {activePreset === 'converter' && 'Convert formats (WebP, JPEG, PNG) and fine-tune quality with strict KB budgets.'}
            {activePreset === 'blur_bokeh' && 'Dual-layer depth active: foreground subject remains pin-sharp while background blur is adjustable.'}
            {activePreset === 'instagram_story' && 'Full 9:16 vertical composition with smart blurred background backdrop.'}
            {activePreset === 'youtube_thumb' && 'High CTR 16:9 canvas with punchy contrast and vibrant cutout pop.'}
          </p>

          {/* Document Verification & Compliance Section */}
          {(activePreset === 'pan_photo' || activePreset === 'passport') && (
            <div className="pt-2 border-t border-brand-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Auto White Background Cutout
                </span>
                <button
                  onClick={() => setAutoCutoutDocument(!autoCutoutDocument)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    autoCutoutDocument
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {autoCutoutDocument ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>{activePreset === 'pan_photo' ? '213×213 px OK' : '600×600 px OK'}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>300 DPI Embedded</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>{activePreset === 'pan_photo' ? '<30 KB Target' : '<100 KB Target'}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>#FFFFFF Pure White</span>
                </div>
              </div>

              <p className="text-[9px] text-zinc-500 dark:text-zinc-400 italic leading-snug">
                Independent client-side utility. EverydayCut is not affiliated with, endorsed by, or connected to NSDL (Protean), UTIITSL, Passport Seva, or the Income Tax Department of India.
              </p>
            </div>
          )}

          {activePreset === 'pan_signature' && (
            <div className="pt-2 border-t border-brand-500/20 space-y-2">
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>400×200 px OK</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>300 DPI Embedded</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>&lt;20 KB Target</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>Ink High-Pass</span>
                </div>
              </div>

              <p className="text-[9px] text-zinc-500 dark:text-zinc-400 italic leading-snug">
                Independent client-side utility. EverydayCut is not affiliated with, endorsed by, or connected to NSDL (Protean), UTIITSL, or the Income Tax Department of India.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Top Tab Switcher */}
      <div className="grid grid-cols-5 border-b border-borderDark p-1 gap-1 bg-zinc-100 dark:bg-zinc-900/70 shrink-0">
        <button
          onClick={() => setActiveTab('background')}
          title="Background Styling"
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-semibold transition-all ${
            activeTab === 'background'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/50'
          }`}
        >
          <Palette className="w-4 h-4 text-brand-500 mb-0.5" />
          <span>Backdrop</span>
        </button>

        <button
          onClick={() => setActiveTab('shadow')}
          title="Shadows & Contact"
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-semibold transition-all ${
            activeTab === 'shadow'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/50'
          }`}
        >
          <Layers className="w-4 h-4 text-brand-500 mb-0.5" />
          <span>Shadows</span>
        </button>

        <button
          onClick={() => setActiveTab('filters')}
          title="Color & Lighting Adjustments"
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-semibold transition-all ${
            activeTab === 'filters'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/50'
          }`}
        >
          <Sliders className="w-4 h-4 text-brand-500 mb-0.5" />
          <span>Adjust</span>
        </button>

        <button
          onClick={() => setActiveTab('text')}
          title="Text & Promotional Badges"
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-semibold transition-all ${
            activeTab === 'text'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/50'
          }`}
        >
          <Type className="w-4 h-4 text-brand-500 mb-0.5" />
          <span>Badges</span>
        </button>

        <button
          onClick={() => setActiveTab('enhance')}
          title="AI Tools: Magic Eraser & 4K Clarity Upscaler"
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-semibold transition-all ${
            activeTab === 'enhance'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/50'
          }`}
        >
          <Wand2 className="w-4 h-4 text-brand-500 mb-0.5" />
          <span>AI Tools</span>
        </button>
      </div>

      {/* Main Tab Body */}
      <div className="p-4 flex-1 space-y-6">
        {/* === TAB 1: BACKGROUND === */}
        {activeTab === 'background' && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-400 uppercase tracking-wider block mb-2">
                Fill Style
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                {(['transparent', 'solid', 'gradient'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setBackgroundFill({ type })}
                    className={`py-1.5 text-xs font-medium capitalize rounded-md transition-all ${
                      backgroundFill.type === type
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Solid Color Palette */}
            {backgroundFill.type === 'solid' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">Color Palette</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 uppercase">
                      {backgroundFill.color}
                    </span>
                    <input
                      type="color"
                      value={backgroundFill.color}
                      onChange={(e) => setBackgroundFill({ color: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((hex) => (
                    <button
                      key={hex}
                      onClick={() => setBackgroundFill({ color: hex })}
                      className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-700/80 transition-transform hover:scale-110 flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: hex }}
                    >
                      {backgroundFill.color.toLowerCase() === hex.toLowerCase() && (
                        <Check
                          className={`w-4 h-4 ${
                            hex === '#ffffff' ? 'text-black' : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Gradient Studio */}
            {backgroundFill.type === 'gradient' && (
              <div className="space-y-4">
                {/* Linear vs Radial Style Toggle */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Gradient Style</span>
                    <button
                      onClick={() => {
                        const curStart = backgroundFill.gradient.startColor;
                        const curEnd = backgroundFill.gradient.endColor;
                        setBackgroundFill({
                          gradient: {
                            ...backgroundFill.gradient,
                            startColor: curEnd,
                            endColor: curStart,
                          },
                        });
                      }}
                      className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                    >
                      Swap Colors ⇄
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
                    {(['linear', 'radial'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() =>
                          setBackgroundFill({
                            gradient: { ...backgroundFill.gradient, style: st },
                          })
                        }
                        className={`py-1.5 rounded-md capitalize font-medium transition-all ${
                          (backgroundFill.gradient.style || 'linear') === st
                            ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Stops */}
                <div className="p-3 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                    Custom Color Stops
                  </span>

                  {/* Start Color */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Start Color (0%)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-zinc-700 dark:text-zinc-300 uppercase">
                        {backgroundFill.gradient.startColor}
                      </span>
                      <input
                        type="color"
                        value={backgroundFill.gradient.startColor}
                        onChange={(e) =>
                          setBackgroundFill({
                            gradient: { ...backgroundFill.gradient, startColor: e.target.value },
                          })
                        }
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Optional Middle Stop */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Mid Color (50%)</span>
                      {backgroundFill.gradient.midColor ? (
                        <button
                          onClick={() =>
                            setBackgroundFill({
                              gradient: { ...backgroundFill.gradient, midColor: undefined },
                            })
                          }
                          className="text-[10px] text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setBackgroundFill({
                              gradient: { ...backgroundFill.gradient, midColor: '#a855f7' },
                            })
                          }
                          className="text-[10px] text-brand-500 hover:underline"
                        >
                          + Add Stop
                        </button>
                      )}
                    </div>

                    {backgroundFill.gradient.midColor && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-zinc-700 dark:text-zinc-300 uppercase">
                          {backgroundFill.gradient.midColor}
                        </span>
                        <input
                          type="color"
                          value={backgroundFill.gradient.midColor}
                          onChange={(e) =>
                            setBackgroundFill({
                              gradient: { ...backgroundFill.gradient, midColor: e.target.value },
                            })
                          }
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                        />
                      </div>
                    )}
                  </div>

                  {/* End Color */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400">End Color (100%)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-zinc-700 dark:text-zinc-300 uppercase">
                        {backgroundFill.gradient.endColor}
                      </span>
                      <input
                        type="color"
                        value={backgroundFill.gradient.endColor}
                        onChange={(e) =>
                          setBackgroundFill({
                            gradient: { ...backgroundFill.gradient, endColor: e.target.value },
                          })
                        }
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Angle Slider (For Linear Gradients) */}
                {(backgroundFill.gradient.style || 'linear') === 'linear' && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5" />
                        Linear Angle
                      </span>
                      <span className="font-mono text-zinc-700 dark:text-zinc-300">{gradientAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={gradientAngle}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setGradientAngle(val);
                        setBackgroundFill({
                          gradient: { ...backgroundFill.gradient, angle: val },
                        });
                      }}
                      className="w-full accent-brand-500 bg-zinc-200 dark:bg-zinc-800"
                    />
                  </div>
                )}

                {/* Preset Gradient Swatches */}
                <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">
                    Curated Presets
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PRESET_GRADIENTS.map((grad, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          setBackgroundFill({
                            gradient: {
                              style: 'linear',
                              startColor: grad.start,
                              endColor: grad.end,
                              angle: gradientAngle,
                            },
                          })
                        }
                        className="h-10 rounded-lg border border-zinc-300 dark:border-zinc-700/80 transition-transform hover:scale-[1.03] flex items-center justify-center font-medium text-[11px] text-white shadow-sm"
                        style={{
                          background: `linear-gradient(${gradientAngle}deg, ${grad.start}, ${grad.end})`,
                        }}
                      >
                        {grad.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === TAB 2: SHADOWS === */}
        {activeTab === 'shadow' && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-400 uppercase tracking-wider block mb-2">
                Shadow Style
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                {(['none', 'drop_shadow', 'soft_shadow'] as ShadowType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveShadow({ type })}
                    className={`py-1.5 text-xs font-medium capitalize rounded-md transition-all ${
                      activeLayer?.shadow.type === type
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {activeLayer?.shadow.type !== 'none' && (
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                    <span>Blur Radius</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{activeLayer?.shadow.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={activeLayer?.shadow.blur || 0}
                    onChange={(e) => setActiveShadow({ blur: Number(e.target.value) })}
                    className="w-full accent-brand-500 bg-zinc-200 dark:bg-zinc-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                    <span>Opacity</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">
                      {Math.round((activeLayer?.shadow.opacity || 0) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round((activeLayer?.shadow.opacity || 0) * 100)}
                    onChange={(e) => setActiveShadow({ opacity: Number(e.target.value) / 100 })}
                    className="w-full accent-brand-500 bg-zinc-200 dark:bg-zinc-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                    <span>Horizontal Offset (X)</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{activeLayer?.shadow.x}px</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={activeLayer?.shadow.x || 0}
                    onChange={(e) => setActiveShadow({ x: Number(e.target.value) })}
                    className="w-full accent-brand-500 bg-zinc-200 dark:bg-zinc-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                    <span>Vertical Offset (Y)</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{activeLayer?.shadow.y}px</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={activeLayer?.shadow.y || 0}
                    onChange={(e) => setActiveShadow({ y: Number(e.target.value) })}
                    className="w-full accent-brand-500 bg-zinc-200 dark:bg-zinc-800"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">Shadow Color</span>
                  <input
                    type="color"
                    value={activeLayer?.shadow.color || '#000000'}
                    onChange={(e) => setActiveShadow({ color: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* === TAB 3: ADJUSTMENTS (WORKING KONVA FILTERS) === */}
        {activeTab === 'filters' && (
          <div className="space-y-5">
            {activePreset === 'blur_bokeh' && (
              <div className="p-2.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span className="font-semibold">Controlling Background Blur Intensity (Subject Remains Pin-Sharp)</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-400 uppercase tracking-wider block">
                Color &amp; Lighting
              </label>
              <button
                onClick={() =>
                  setActiveFilters({ brightness: 0, contrast: 0, saturation: 0, blur: 0 })
                }
                className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                Reset All
              </button>
            </div>

            {/* Brightness */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>Brightness</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">{activeLayer?.filters.brightness || 0}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={activeLayer?.filters.brightness || 0}
                onChange={(e) => setActiveFilters({ brightness: Number(e.target.value) })}
                className="w-full accent-brand-500 bg-zinc-200 dark:bg-zinc-800"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>Contrast</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">{activeLayer?.filters.contrast || 0}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={activeLayer?.filters.contrast || 0}
                onChange={(e) => setActiveFilters({ contrast: Number(e.target.value) })}
                className="w-full accent-brand-500 bg-zinc-200 dark:bg-zinc-800"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>Saturation</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">{activeLayer?.filters.saturation || 0}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={activeLayer?.filters.saturation || 0}
                onChange={(e) => setActiveFilters({ saturation: Number(e.target.value) })}
                className="w-full accent-brand-500 bg-zinc-200 dark:bg-zinc-800"
              />
            </div>

            {/* Gaussian Blur */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>Edge Softness / Blur</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">{activeLayer?.filters.blur || 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={activeLayer?.filters.blur || 0}
                onChange={(e) => setActiveFilters({ blur: Number(e.target.value) })}
                className="w-full accent-brand-500 bg-zinc-200 dark:bg-zinc-800"
              />
            </div>
          </div>
        )}

        {/* === TAB 4: TEXT & BADGES === */}
        {activeTab === 'text' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-400 uppercase tracking-wider block">
                E-Commerce Badges
              </label>
              <button
                onClick={() => addTextLayer()}
                className="px-2.5 py-1 rounded bg-brand-500/20 hover:bg-brand-500/30 text-brand-600 dark:text-brand-400 border border-brand-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3 h-3" />
                <span>Add Text</span>
              </button>
            </div>

            {/* 1-Click Preset Badges */}
            <div className="grid grid-cols-2 gap-2">
              {TEXT_BADGE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    addTextLayer({
                      text: p.text,
                      badgeStyle: p.badgeStyle,
                      badgeColor: p.badgeColor,
                      fill: p.fill,
                    })
                  }
                  className="h-9 px-2 rounded-lg border border-zinc-200 dark:border-zinc-700/80 hover:border-brand-500 transition-all flex items-center justify-center text-xs font-bold shadow text-white"
                  style={{
                    backgroundColor: p.badgeStyle === 'outline' ? 'transparent' : p.badgeColor,
                    borderColor: p.badgeColor,
                    color: p.fill,
                  }}
                >
                  {p.text}
                </button>
              ))}
            </div>

            {/* Selected Text Layer Inspector */}
            {activeLayer?.type === 'text' && activeLayer.textConfig && (
              <div className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-white">Edit Selected Text</span>
                  <button
                    onClick={() => removeLayer(activeLayer.id)}
                    className="p-1 text-zinc-500 hover:text-red-500 transition-colors"
                    title="Delete Text Layer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Text String Input */}
                <div className="space-y-1">
                  <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Content</span>
                  <input
                    type="text"
                    value={activeLayer.textConfig.text}
                    onChange={(e) => updateActiveTextConfig({ text: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>

                {/* Font Size Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                    <span>Font Size</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{activeLayer.textConfig.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="96"
                    value={activeLayer.textConfig.fontSize}
                    onChange={(e) => updateActiveTextConfig({ fontSize: Number(e.target.value) })}
                    className="w-full accent-brand-500 bg-zinc-200 dark:bg-zinc-800"
                  />
                </div>

                {/* Badge Style Selector */}
                <div className="space-y-1">
                  <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Badge Container</span>
                  <div className="grid grid-cols-4 gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px]">
                    {(['none', 'pill', 'solid', 'outline'] as BadgeStyle[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => updateActiveTextConfig({ badgeStyle: st })}
                        className={`py-1 rounded capitalize font-medium transition-colors ${
                          activeLayer.textConfig?.badgeStyle === st
                            ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Pickers */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center justify-between p-2 bg-zinc-100 dark:bg-zinc-900/60 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Text Color</span>
                    <input
                      type="color"
                      value={activeLayer.textConfig.fill}
                      onChange={(e) => updateActiveTextConfig({ fill: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-zinc-100 dark:bg-zinc-900/60 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Badge Color</span>
                    <input
                      type="color"
                      value={activeLayer.textConfig.badgeColor}
                      onChange={(e) => updateActiveTextConfig({ badgeColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === TAB 5: AI TOOLS (MAGIC ERASER & UPSCALER) === */}
        {activeTab === 'enhance' && (
          <div className="space-y-6">
            {/* Tool 1: Magic Eraser */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-xs">
                <Eraser className="w-4 h-4 text-brand-500" />
                <span>Magic Eraser (Inpainting)</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Brush over unwanted objects, blemishes, watermarks, or text. Our client-side Fast Marching engine removes them seamlessly.
              </p>
              <button
                onClick={() => setEditorMode('eraser')}
                disabled={!activeLayer?.src || activeLayer.type === 'text'}
                className="w-full py-2 px-3 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-brand-600 dark:text-brand-400 border border-zinc-300 dark:border-zinc-700/80 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm hover:border-brand-500/50 disabled:opacity-40"
              >
                <Eraser className="w-3.5 h-3.5 text-brand-500" />
                <span>Launch Magic Eraser</span>
              </button>
            </div>

            {/* Tool 2: High-Precision 4K Clarity Upscaler & Sharpness Enhancer */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-xs">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span>High-Precision 4K Clarity Upscaler &amp; Sharpness Enhancer</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Enhance photo clarity and edge sharpness using adaptive high-frequency edge reconstruction and contrast enhancement.
              </p>

              {upscaleStatus && (
                <div className="p-2 bg-brand-500/10 border border-brand-500/30 rounded-lg text-brand-600 dark:text-brand-400 text-[11px] flex items-center gap-1.5 font-medium">
                  {isUpscaling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{upscaleStatus}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleUpscale(2)}
                  disabled={isUpscaling || !activeLayer?.src || activeLayer.type === 'text'}
                  className="py-2 px-3 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold text-xs border border-zinc-300 dark:border-zinc-700/80 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-sm"
                >
                  <span>2x HD Clarity</span>
                </button>
                <button
                  onClick={() => handleUpscale(4)}
                  disabled={isUpscaling || !activeLayer?.src || activeLayer.type === 'text'}
                  className="py-2 px-3 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold text-xs border border-zinc-300 dark:border-zinc-700/80 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-sm"
                >
                  <span>4x Ultra HD Clarity</span>
                </button>
              </div>
            </div>

            {/* Tool 3: Image Compressor & Format Converter Studio */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-xs">
                <FileCheck className="w-4 h-4 text-brand-500" />
                <span>Image Compressor &amp; Format Converter</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Convert to next-gen WebP, standard JPEG, or PNG with fine-tuned quality control and strict file budget limits.
              </p>

              {/* Format selection */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">Export Format</span>
                <div className="grid grid-cols-3 gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
                  {(['webp', 'jpeg', 'png'] as ExportFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setCompressFormat(fmt)}
                      className={`py-1.5 rounded font-bold uppercase transition-all ${
                        compressFormat === fmt
                          ? 'bg-brand-500 text-black shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality slider for WebP & JPEG */}
              {compressFormat !== 'png' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                    <span>Quality Level</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300 font-bold">
                      {Math.round(compressQuality * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={Math.round(compressQuality * 100)}
                    onChange={(e) => setCompressQuality(Number(e.target.value) / 100)}
                    className="w-full accent-brand-500 bg-zinc-200 dark:bg-zinc-800"
                  />
                </div>
              )}

              {/* Strict KB Target Limits */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">File Budget Limit</span>
                <div className="grid grid-cols-5 gap-1 text-[10px]">
                  {[
                    { label: 'None', val: null },
                    { label: '<20KB', val: 20 },
                    { label: '<30KB', val: 30 },
                    { label: '<50KB', val: 50 },
                    { label: '<100KB', val: 100 },
                  ].map((budget) => (
                    <button
                      key={budget.label}
                      onClick={() => setCompressMaxKb(budget.val)}
                      className={`py-1 px-1 rounded font-bold border transition-all ${
                        compressMaxKb === budget.val
                          ? 'bg-brand-500/20 border-brand-500 text-brand-600 dark:text-brand-400 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                      }`}
                    >
                      {budget.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <label htmlFor="custom-kb-budget" className="text-[10px] text-zinc-500 dark:text-zinc-400 shrink-0">
                    Custom KB:
                  </label>
                  <input
                    id="custom-kb-budget"
                    type="number"
                    min={5}
                    max={5000}
                    placeholder="e.g. 45"
                    value={compressMaxKb ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setCompressMaxKb(raw ? Math.max(5, Number(raw)) : null);
                    }}
                    className="w-full px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Instant Export Button */}
              <button
                onClick={handleCompressExport}
                disabled={isCompressing || !activeLayer?.src}
                className="w-full min-h-[44px] py-2.5 px-3 rounded-lg bg-brand-500 hover:bg-brand-600 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-40"
              >
                {isCompressing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>
                  Export {compressFormat.toUpperCase()} ({Math.round(compressQuality * 100)}% Qual{compressMaxKb ? ` • <${compressMaxKb}KB` : ''})
                </span>
              </button>
              {lastCompressInfo && (
                <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5">
                  {lastCompressInfo}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fixed 300x250 Ad Container */}
        <AdBannerSlot placement="sidebar" />
      </div>

      {/* Footer Navigation & Legal Links */}
      <footer className="p-3 border-t border-borderDark text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <a
            href="https://everydaypdf.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            title="52+ Free PDF Tools"
          >
            EverydayPDF →
          </a>
          <span className="text-zinc-400 dark:text-zinc-600">•</span>
          <button onClick={onOpenAbout} className="min-h-[44px] px-1 flex items-center hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            About
          </button>
          {isPwaInstallable && !isPwaInstalled && (
            <>
              <span className="text-zinc-400 dark:text-zinc-600">•</span>
              <button
                onClick={onInstallPwa}
                className="min-h-[44px] px-1 flex items-center text-brand-600 dark:text-brand-400 font-semibold hover:underline"
              >
                Install App
              </button>
            </>
          )}
          {isPwaInstalled && (
            <>
              <span className="text-zinc-400 dark:text-zinc-600">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Offline Ready ✓</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onOpenPrivacy} className="min-h-[44px] px-1 flex items-center hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            Privacy
          </button>
          <button onClick={onOpenTerms} className="min-h-[44px] px-1 flex items-center hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            Terms
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('everydaycut:open-cookie-settings'))}
            className="min-h-[44px] px-1 flex items-center hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            Cookies
          </button>
        </div>
      </footer>
    </aside>
  </>
  );
};

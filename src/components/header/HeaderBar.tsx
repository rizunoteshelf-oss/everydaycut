import React, { useState } from 'react';
import {
  Scissors,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Plus,
  ChevronDown,
  Ratio,
  Layers,
  Eraser,
  Type,
  Sun,
  Moon,
  Sparkles,
  Columns2,
} from 'lucide-react';
import { useEditorStore } from '../../engine/state/editorStore.ts';
import { useHistoryStore } from '../../engine/state/historyStore.ts';
import { useStageZoom } from '../../engine/canvas/useStageZoom.ts';
import { exportCanvasImage } from '../../utils/imageExport.ts';
import Konva from 'konva';
import { AspectRatioPreset, ToolPresetId } from '../../engine/state/types.ts';
import { getSEOEntryByPreset } from '../../seo/seoData.ts';
import { STUDIO_TOOLS } from '../../config/toolCatalog.ts';

const QUICK_NAV_IDS: ToolPresetId[] = ['pan_photo', 'cutout', 'eraser', 'converter'];

const ASPECT_RATIOS: { id: AspectRatioPreset; label: string; desc: string }[] = [
  { id: 'original', label: 'Original', desc: 'Auto fit' },
  { id: '1:1', label: '1:1 Square', desc: 'Instagram post' },
  { id: '4:5', label: '4:5 Portrait', desc: 'Instagram feed' },
  { id: '9:16', label: '9:16 Story', desc: 'Reels / TikTok' },
  { id: '16:9', label: '16:9 Landscape', desc: 'YouTube / Web' },
  { id: '3:4', label: '3:4 Vertical', desc: 'Standard portrait' },
  { id: '4:3', label: '4:3 Standard', desc: 'Standard display' },
];

interface HeaderBarProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  onNewImage: () => void;
  onNavigateHome?: () => void;
  onSelectTool?: (presetId: ToolPresetId) => void;
  onOpenBatch?: () => void;
  onExportSuccess?: () => void;
  onInstallPwa?: () => void;
  isPwaInstallable?: boolean;
  isPwaInstalled?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  stageRef,
  onNewImage,
  onNavigateHome,
  onSelectTool,
  onOpenBatch,
  onExportSuccess,
  onInstallPwa,
  isPwaInstallable,
  isPwaInstalled,
}) => {
  const {
    aspectRatio,
    setAspectRatio,
    zoom,
    layers,
    undo,
    redo,
    setEditorMode,
    addTextLayer,
    setActiveTab,
    theme,
    toggleTheme,
    activePreset,
    setActivePreset,
    customDimensions,
    targetMaxSizeBytes,
    originalImageSrc,
    showBeforeAfter,
    setShowBeforeAfter,
  } = useEditorStore();

  const { canUndo, canRedo } = useHistoryStore();
  const { zoomIn, zoomOut, resetToFit } = useStageZoom();

  const [isExporting, setIsExporting] = useState(false);
  const [showAspectMenu, setShowAspectMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);

  const getPresetLabel = () => {
    switch (activePreset) {
      case 'pan_photo':
        return '🇮🇳 PAN Photo (213×213 • <30KB)';
      case 'pan_signature':
        return '🇮🇳 PAN Signature (400×200 • <20KB)';
      case 'passport':
        return '🛂 Passport (600×600 px)';
      case 'amazon':
        return '🛒 Amazon Stager (1:1)';
      case 'shopify':
        return '🛍️ Shopify Stager';
      case 'pfp_maker':
        return '👤 Profile Avatar';
      case 'instagram_story':
        return '📱 Story (9:16)';
      case 'youtube_thumb':
        return '🖼️ YouTube (16:9)';
      default:
        return null;
    }
  };

  const handleExport = async (format: 'png' | 'jpeg' | 'webp') => {
    if (!stageRef.current) return;
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const isDocument =
        activePreset === 'pan_photo' ||
        activePreset === 'pan_signature' ||
        activePreset === 'passport';

      await exportCanvasImage(stageRef.current, {
        format,
        quality: 0.95,
        fileName: activePreset
          ? `everydaycut-${activePreset}-${Date.now()}`
          : `everydaycut-${aspectRatio}-${Date.now()}`,
        targetDimensions: customDimensions || undefined,
        targetMaxSizeBytes: targetMaxSizeBytes || undefined,
        embed300Dpi: isDocument,
      });
      if (onExportSuccess) {
        onExportSuccess();
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="sticky top-0 w-full min-w-0 h-14 bg-panel border-b border-borderDark px-2.5 sm:px-4 flex items-center justify-between gap-2 z-30 shrink-0">
      {/* Left: Brand Identity & Batch Mode Trigger */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <a
          href="/"
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            setShowToolsMenu(false);
            if (onNavigateHome) {
              onNavigateHome();
            } else {
              onNewImage();
              setActivePreset(null);
              window.history.pushState(null, '', '/');
            }
          }}
          className="flex items-center gap-2 sm:gap-2.5 shrink-0 group"
          title="EverydayCut Homepage — All Free Client-Side Tools"
        >
          <div className="w-8 h-8 rounded-lg bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0 group-hover:scale-105 transition-transform">
            <Scissors className="w-4 h-4" />
          </div>
          <div className={`flex-col shrink-0 ${layers.length > 0 ? 'hidden sm:flex' : 'flex'}`}>
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 whitespace-nowrap">
              EverydayCut
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                Free &amp; Client-Side
              </span>
            </span>
          </div>
        </a>

        {getPresetLabel() && (
          <span className="hidden xl:inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-400 border border-brand-500/30 shadow-sm">
            {getPresetLabel()}
          </span>
        )}

        {onOpenBatch && (
          <button
            onClick={onOpenBatch}
            className="hidden md:flex ml-1 px-3 py-2 min-h-[44px] text-xs font-semibold text-brand-700 dark:text-brand-400 hover:text-slate-900 dark:hover:text-white bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 rounded-lg items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Batch background removal with ZIP download"
          >
            <Layers className="w-3.5 h-3.5 text-brand-500" />
            <span>Batch Cutout</span>
          </button>
        )}

        {isPwaInstallable && !isPwaInstalled && (
          <button
            onClick={onInstallPwa}
            className="ml-1 px-2.5 py-2 min-h-[44px] text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-slate-900 dark:hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Install EverydayCut App to Home Screen"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}
      </div>

      {/* Middle: Quick Tool Links + Dynamic All-Tools Dropdown (Landing/Home) OR Canvas Tools (Editor) */}
      {layers.length === 0 ? (
        <div className="flex items-center gap-2 relative">
          <nav className="hidden lg:flex items-center gap-1 mr-1" aria-label="Popular studio tools">
            {QUICK_NAV_IDS.map((id) => {
              const tool = STUDIO_TOOLS.find((item) => item.id === id);
              if (!tool) return null;
              const seo = getSEOEntryByPreset(tool.id);
              const isCurrent = activePreset === tool.id;
              return (
                <a
                  key={tool.id}
                  href={`/${seo.slug}`}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    e.preventDefault();
                    setShowToolsMenu(false);
                    if (onSelectTool) {
                      onSelectTool(tool.id);
                    } else {
                      setActivePreset(tool.id);
                      window.history.pushState(null, '', `/${seo.slug}`);
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    isCurrent
                      ? 'bg-brand-500/15 text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {tool.shortLabel}
                </a>
              );
            })}
          </nav>

          <button
            onClick={() => setShowToolsMenu(!showToolsMenu)}
            className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-zinc-100 dark:bg-zinc-800/90 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 text-xs font-semibold text-slate-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/60 shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>All Tools ({STUDIO_TOOLS.length})</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {showToolsMenu && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-80 max-h-[70vh] overflow-y-auto bg-panel border border-borderDark rounded-2xl shadow-2xl py-2 px-1 z-50 divide-y divide-zinc-100 dark:divide-zinc-800">
              <div className="p-2 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Select Tool ({STUDIO_TOOLS.length})
                </span>
                <a
                  href="/#studio-catalog"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowToolsMenu(false);
                    if (activePreset && onNavigateHome) {
                      onNavigateHome();
                    }
                    setTimeout(() => {
                      document.getElementById('studio-catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }, 60);
                  }}
                  className="text-[11px] font-semibold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:underline cursor-pointer"
                >
                  Full Catalog &darr;
                </a>
              </div>

              <div className="py-1">
                {STUDIO_TOOLS.map((t) => {
                  const seo = getSEOEntryByPreset(t.id);
                  return (
                    <a
                      key={t.id}
                      href={`/${seo.slug}`}
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                        e.preventDefault();
                        setShowToolsMenu(false);
                        if (onSelectTool) {
                          onSelectTool(t.id);
                        } else {
                          setActivePreset(t.id);
                          window.history.pushState(null, '', `/${seo.slug}`);
                        }
                        if (t.id === 'batch' && onOpenBatch) {
                          onOpenBatch();
                        }
                      }}
                      className={`w-full px-3 py-2 text-left rounded-lg text-xs flex items-center justify-between transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer ${
                        activePreset === t.id
                          ? 'text-emerald-700 dark:text-emerald-400 font-bold bg-brand-500/10'
                          : 'text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <t.icon className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                        <span>{t.title}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal shrink-0 ml-2">
                        {t.categoryLabel}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Aspect Ratio Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAspectMenu(!showAspectMenu)}
              aria-label="Aspect Ratio"
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 min-h-[40px] sm:min-h-0 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 transition-colors"
            >
              <Ratio className="w-3.5 h-3.5 text-brand-500" />
              <span className="hidden sm:inline">{ASPECT_RATIOS.find((r) => r.id === aspectRatio)?.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            </button>

            {showAspectMenu && (
              <div className="absolute left-0 mt-1 w-48 bg-panel border border-borderDark rounded-xl shadow-xl py-1 z-50">
                {ASPECT_RATIOS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setAspectRatio(item.id);
                      setShowAspectMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex flex-col text-xs transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                      aspectRatio === item.id ? 'text-brand-500 font-semibold' : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] text-zinc-500">{item.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Tool: Magic Eraser */}
          <button
            onClick={() => setEditorMode('eraser')}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 transition-colors"
            title="Launch Magic Eraser Inpainting"
          >
            <Eraser className="w-3.5 h-3.5 text-brand-500" />
            <span>Eraser</span>
          </button>

          {/* Quick Tool: Add Text Badge */}
          <button
            onClick={() => {
              addTextLayer();
              setActiveTab('text');
            }}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 transition-colors"
            title="Add Promotional Badge / Text"
          >
            <Type className="w-3.5 h-3.5 text-brand-500" />
            <span>+ Badge</span>
          </button>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
              className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden md:block h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

          {/* Zoom Controls */}
          <div className="hidden md:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={zoomOut}
              title="Zoom Out (-)"
              className="p-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono text-zinc-800 dark:text-zinc-300 px-1 min-w-[42px] text-center">
              {zoom}%
            </span>
            <button
              onClick={zoomIn}
              title="Zoom In (+)"
              className="p-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetToFit}
              title="Fit to Screen"
              className="p-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded transition-colors ml-0.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Right: Actions (Theme Toggle, New & Export) */}
      <div className="flex items-center gap-2">
        {/* Single Non-Duplicated EverydayPDF Cross-Promotion Pill */}
        <a
          href="https://everydaypdf.me"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all shadow-xs whitespace-nowrap"
          title="Visit EverydayPDF.me - 52+ Free Client-Side PDF Tools"
        >
          <span className="xl:hidden">EverydayPDF.me →</span>
          <span className="hidden xl:inline">Need PDF tools? EverydayPDF.me →</span>
        </a>

        {/* Before / After Compare Toggle */}
        {layers.length > 0 && originalImageSrc && (
          <button
            type="button"
            onClick={() => setShowBeforeAfter(!showBeforeAfter)}
            aria-label="Toggle Before and After comparison slider"
            className={`px-3 py-2 min-h-[44px] text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-all shadow-sm ${
              showBeforeAfter
                ? 'bg-brand-500 text-black border-brand-500'
                : 'text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-700/60'
            }`}
            title="Compare Original vs. Processed Result"
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{showBeforeAfter ? 'Comparing' : 'Compare'}</span>
          </button>
        )}

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-700/60 transition-all shadow-sm"
          title={`Switch to ${theme === 'dark' ? 'White/Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {layers.length > 0 && (
          <button
            onClick={onNewImage}
            aria-label="New Image"
            className="px-2.5 sm:px-3 py-2 min-h-[44px] text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span>
          </button>
        )}

        {layers.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="px-3 sm:px-4 py-2 min-h-[44px] rounded-lg bg-brand-500 hover:bg-brand-600 text-black font-semibold text-xs transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-panel border border-borderDark rounded-xl shadow-xl py-1 z-50">
                <button
                  onClick={() => handleExport('png')}
                  className="w-full px-3 py-2 text-left flex flex-col text-xs text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="font-semibold text-zinc-900 dark:text-white">PNG Image</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Crisp transparent alpha HD</span>
                </button>
                <button
                  onClick={() => handleExport('jpeg')}
                  className="w-full px-3 py-2 text-left flex flex-col text-xs text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-t border-zinc-200 dark:border-zinc-800"
                >
                  <span className="font-semibold text-zinc-900 dark:text-white flex items-center justify-between">
                    <span>JPEG Image</span>
                    {targetMaxSizeBytes && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                        &lt;{Math.round(targetMaxSizeBytes / 1000)}KB
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    {targetMaxSizeBytes
                      ? `Auto-compressed for government portal upload`
                      : 'High quality solid/gradient'}
                  </span>
                </button>
                <button
                  onClick={() => handleExport('webp')}
                  className="w-full px-3 py-2 text-left flex flex-col text-xs text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-t border-zinc-200 dark:border-zinc-800"
                >
                  <span className="font-semibold text-zinc-900 dark:text-white flex items-center justify-between">
                    <span>WebP Image</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                      Modern 40% Smaller
                    </span>
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    High-efficiency next-gen web asset
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

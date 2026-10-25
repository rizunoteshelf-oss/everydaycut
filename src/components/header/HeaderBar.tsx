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
} from 'lucide-react';
import { useEditorStore } from '../../engine/state/editorStore.ts';
import { useHistoryStore } from '../../engine/state/historyStore.ts';
import { useStageZoom } from '../../engine/canvas/useStageZoom.ts';
import { exportCanvasImage } from '../../utils/imageExport.ts';
import Konva from 'konva';
import { AspectRatioPreset } from '../../engine/state/types.ts';

const ASPECT_RATIOS: { id: AspectRatioPreset; label: string; desc: string }[] = [
  { id: 'original', label: 'Original', desc: 'Auto fit' },
  { id: '1:1', label: '1:1 Square', desc: 'Instagram post' },
  { id: '4:5', label: '4:5 Portrait', desc: 'Instagram feed' },
  { id: '9:16', label: '9:16 Story', desc: 'Reels / TikTok' },
  { id: '16:9', label: '16:9 Landscape', desc: 'YouTube / Web' },
];

interface HeaderBarProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  onNewImage: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ stageRef, onNewImage }) => {
  const {
    aspectRatio,
    setAspectRatio,
    zoom,
    layers,
    undo,
    redo,
  } = useEditorStore();

  const { canUndo, canRedo } = useHistoryStore();
  const { zoomIn, zoomOut, resetToFit } = useStageZoom();

  const [isExporting, setIsExporting] = useState(false);
  const [showAspectMenu, setShowAspectMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = async (format: 'png' | 'jpeg') => {
    if (!stageRef.current) return;
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      await exportCanvasImage(stageRef.current, {
        format,
        quality: 0.98,
        fileName: `everydaycut-${aspectRatio}-${Date.now()}`,
      });
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="h-14 bg-panel border-b border-borderDark px-4 flex items-center justify-between z-30 shrink-0">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-500">
          <Scissors className="w-4 h-4 text-brand-500" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
            EverydayCut
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
              Free & Client-Side
            </span>
          </span>
        </div>
      </div>

      {/* Middle: Canvas Tools (Aspect Ratio, Undo/Redo, Zoom) */}
      {layers.length > 0 && (
        <div className="flex items-center gap-3">
          {/* Aspect Ratio Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAspectMenu(!showAspectMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-xs font-medium text-zinc-300 border border-zinc-700/60 transition-colors"
            >
              <Ratio className="w-3.5 h-3.5 text-brand-500" />
              <span>{ASPECT_RATIOS.find((r) => r.id === aspectRatio)?.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
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
                    className={`w-full px-3 py-2 text-left flex flex-col text-xs transition-colors hover:bg-zinc-800 ${
                      aspectRatio === item.id ? 'text-brand-500 font-semibold' : 'text-zinc-300'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] text-zinc-500">{item.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-zinc-800" />

          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-zinc-800" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-zinc-900/60 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={zoomOut}
              title="Zoom Out (-)"
              className="p-1 text-zinc-400 hover:text-white rounded transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono text-zinc-300 px-1 min-w-[42px] text-center">
              {zoom}%
            </span>
            <button
              onClick={zoomIn}
              title="Zoom In (+)"
              className="p-1 text-zinc-400 hover:text-white rounded transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetToFit}
              title="Fit to Screen"
              className="p-1 text-zinc-400 hover:text-white rounded transition-colors ml-0.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Right: Actions (New & Export) */}
      <div className="flex items-center gap-2">
        {layers.length > 0 && (
          <button
            onClick={onNewImage}
            className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        )}

        {layers.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="px-4 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-black font-semibold text-xs transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-panel border border-borderDark rounded-xl shadow-xl py-1 z-50">
                <button
                  onClick={() => handleExport('png')}
                  className="w-full px-3 py-2 text-left flex flex-col text-xs text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  <span className="font-semibold text-white">PNG Image</span>
                  <span className="text-[10px] text-zinc-400">Crisp transparent alpha HD</span>
                </button>
                <button
                  onClick={() => handleExport('jpeg')}
                  className="w-full px-3 py-2 text-left flex flex-col text-xs text-zinc-200 hover:bg-zinc-800 transition-colors border-t border-zinc-800"
                >
                  <span className="font-semibold text-white">JPEG Image</span>
                  <span className="text-[10px] text-zinc-400">High quality solid/gradient</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

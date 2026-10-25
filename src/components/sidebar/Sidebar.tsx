import React, { useState } from 'react';
import {
  Palette,
  Layers,
  Sliders,
  Check,
  RotateCw,
} from 'lucide-react';
import { useEditorStore } from '../../engine/state/editorStore.ts';
import { AdBannerSlot } from '../ads/AdBannerSlot.tsx';
import { ShadowType } from '../../engine/state/types.ts';

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

interface SidebarProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenAbout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onOpenAbout,
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
  } = useEditorStore();

  const activeLayer = layers.find((l) => l.id === activeLayerId) || layers[0];
  const [gradientAngle, setGradientAngle] = useState(backgroundFill.gradient.angle || 135);

  return (
    <aside className="w-80 h-full bg-panel border-l border-borderDark flex flex-col shrink-0 overflow-y-auto">
      {/* Top Tab Switcher */}
      <div className="flex items-center border-b border-borderDark p-2 gap-1 bg-zinc-900/50">
        <button
          onClick={() => setActiveTab('background')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'background'
              ? 'bg-zinc-800 text-white shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          <Palette className="w-4 h-4 text-brand-500" />
          Background
        </button>
        <button
          onClick={() => setActiveTab('shadow')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'shadow'
              ? 'bg-zinc-800 text-white shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          <Layers className="w-4 h-4 text-brand-500" />
          Shadows
        </button>
        <button
          onClick={() => setActiveTab('filters')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'filters'
              ? 'bg-zinc-800 text-white shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          <Sliders className="w-4 h-4 text-brand-500" />
          Adjust
        </button>
      </div>

      {/* Main Tab Body */}
      <div className="p-4 flex-1 space-y-6">
        {/* === TAB 1: BACKGROUND === */}
        {activeTab === 'background' && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                Fill Style
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                {(['transparent', 'solid', 'gradient'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setBackgroundFill({ type })}
                    className={`py-1.5 text-xs font-medium capitalize rounded-md transition-all ${
                      backgroundFill.type === type
                        ? 'bg-zinc-800 text-white shadow'
                        : 'text-zinc-400 hover:text-white'
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
                  <span className="text-xs text-zinc-400">Color Palette</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-300 uppercase">
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
                      className="w-8 h-8 rounded-full border border-zinc-700/80 transition-transform hover:scale-110 flex items-center justify-center"
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

            {/* Gradient Presets */}
            {backgroundFill.type === 'gradient' && (
              <div className="space-y-4">
                <span className="text-xs text-zinc-400 block">Gradient Presets</span>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_GRADIENTS.map((grad, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        setBackgroundFill({
                          gradient: {
                            startColor: grad.start,
                            endColor: grad.end,
                            angle: gradientAngle,
                          },
                        })
                      }
                      className="h-12 rounded-lg border border-zinc-700/80 transition-transform hover:scale-[1.02] flex items-center justify-center font-medium text-xs text-white shadow"
                      style={{
                        background: `linear-gradient(${gradientAngle}deg, ${grad.start}, ${grad.end})`,
                      }}
                    >
                      {grad.name}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5" />
                      Angle
                    </span>
                    <span className="font-mono text-zinc-300">{gradientAngle}°</span>
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
                    className="w-full accent-brand-500 bg-zinc-800"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* === TAB 2: SHADOWS === */}
        {activeTab === 'shadow' && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                Shadow Style
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                {(['none', 'drop_shadow', 'soft_shadow'] as ShadowType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveShadow({ type })}
                    className={`py-1.5 text-xs font-medium capitalize rounded-md transition-all ${
                      activeLayer?.shadow.type === type
                        ? 'bg-zinc-800 text-white shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {activeLayer?.shadow.type !== 'none' && (
              <div className="space-y-4 pt-2">
                {/* Blur Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Blur Radius</span>
                    <span className="font-mono text-zinc-300">{activeLayer?.shadow.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={activeLayer?.shadow.blur || 0}
                    onChange={(e) => setActiveShadow({ blur: Number(e.target.value) })}
                    className="w-full accent-brand-500 bg-zinc-800"
                  />
                </div>

                {/* Opacity Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Opacity</span>
                    <span className="font-mono text-zinc-300">
                      {Math.round((activeLayer?.shadow.opacity || 0) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round((activeLayer?.shadow.opacity || 0) * 100)}
                    onChange={(e) => setActiveShadow({ opacity: Number(e.target.value) / 100 })}
                    className="w-full accent-brand-500 bg-zinc-800"
                  />
                </div>

                {/* Offset X Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Horizontal Offset (X)</span>
                    <span className="font-mono text-zinc-300">{activeLayer?.shadow.x}px</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={activeLayer?.shadow.x || 0}
                    onChange={(e) => setActiveShadow({ x: Number(e.target.value) })}
                    className="w-full accent-brand-500 bg-zinc-800"
                  />
                </div>

                {/* Offset Y Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Vertical Offset (Y)</span>
                    <span className="font-mono text-zinc-300">{activeLayer?.shadow.y}px</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={activeLayer?.shadow.y || 0}
                    onChange={(e) => setActiveShadow({ y: Number(e.target.value) })}
                    className="w-full accent-brand-500 bg-zinc-800"
                  />
                </div>

                {/* Shadow Color */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-zinc-400">Shadow Color</span>
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

        {/* === TAB 3: ADJUSTMENTS === */}
        {activeTab === 'filters' && (
          <div className="space-y-4">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Color & Lighting
            </label>

            {/* Brightness */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Brightness</span>
                <span className="font-mono text-zinc-300">{activeLayer?.filters.brightness || 0}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={activeLayer?.filters.brightness || 0}
                onChange={(e) => setActiveFilters({ brightness: Number(e.target.value) })}
                className="w-full accent-brand-500 bg-zinc-800"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Contrast</span>
                <span className="font-mono text-zinc-300">{activeLayer?.filters.contrast || 0}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={activeLayer?.filters.contrast || 0}
                onChange={(e) => setActiveFilters({ contrast: Number(e.target.value) })}
                className="w-full accent-brand-500 bg-zinc-800"
              />
            </div>

            {/* Gaussian Blur */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Edge Softness / Blur</span>
                <span className="font-mono text-zinc-300">{activeLayer?.filters.blur || 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={activeLayer?.filters.blur || 0}
                onChange={(e) => setActiveFilters({ blur: Number(e.target.value) })}
                className="w-full accent-brand-500 bg-zinc-800"
              />
            </div>
          </div>
        )}

        {/* Fixed 300x250 Ad Container */}
        <AdBannerSlot placement="sidebar" />
      </div>

      {/* Footer Navigation & Legal Links */}
      <footer className="p-3 border-t border-borderDark text-[11px] text-zinc-500 flex items-center justify-between">
        <button onClick={onOpenAbout} className="hover:text-zinc-300 transition-colors">
          About
        </button>
        <div className="flex items-center gap-3">
          <button onClick={onOpenPrivacy} className="hover:text-zinc-300 transition-colors">
            Privacy
          </button>
          <button onClick={onOpenTerms} className="hover:text-zinc-300 transition-colors">
            Terms
          </button>
        </div>
      </footer>
    </aside>
  );
};

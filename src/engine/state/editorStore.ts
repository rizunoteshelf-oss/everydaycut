import { create } from 'zustand';
import {
  Layer,
  BackgroundFill,
  AspectRatioPreset,
  CanvasDimensions,
  SegmentationProgress,
  ShadowSettings,
  FilterSettings,
  TextConfig,
  EditorMode,
  ToolPresetId,
  GuideOverlayType,
} from './types.ts';
import { EditorSnapshot, useHistoryStore } from './historyStore.ts';

export type ActiveSidebarTab = 'background' | 'shadow' | 'filters' | 'text' | 'enhance';

interface EditorStoreState {
  layers: Layer[];
  activeLayerId: string | null;
  backgroundFill: BackgroundFill;
  aspectRatio: AspectRatioPreset;
  canvasDimensions: CanvasDimensions;
  containerDimensions: CanvasDimensions;
  zoom: number; // percentage, e.g. 100
  activeTab: ActiveSidebarTab;
  editorMode: EditorMode;
  segmentationProgress: SegmentationProgress;
  theme: 'light' | 'dark';
  activePreset: ToolPresetId | null;
  guideOverlay: GuideOverlayType;
  customDimensions: CanvasDimensions | null;
  targetMaxSizeBytes: number | null;

  // Actions
  setLayers: (layers: Layer[]) => void;
  addLayer: (layer: Layer) => void;
  addTextLayer: (config?: Partial<TextConfig>) => void;
  updateActiveTextConfig: (updates: Partial<TextConfig>) => void;
  updateActiveLayer: (updates: Partial<Layer>) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  setActiveLayerId: (id: string | null) => void;
  
  setBackgroundFill: (fill: Partial<BackgroundFill>) => void;
  setAspectRatio: (aspectRatio: AspectRatioPreset) => void;
  setCanvasDimensions: (dims: CanvasDimensions) => void;
  setContainerDimensions: (dims: CanvasDimensions) => void;
  setZoom: (zoom: number) => void;
  setActiveTab: (tab: ActiveSidebarTab) => void;
  setEditorMode: (mode: EditorMode) => void;
  setSegmentationProgress: (progress: Partial<SegmentationProgress>) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setActivePreset: (preset: ToolPresetId | null) => void;
  setGuideOverlay: (overlay: GuideOverlayType) => void;
  applyToolPreset: (preset: ToolPresetId) => void;

  // Shadow & Filter helpers on active layer
  setActiveShadow: (shadow: Partial<ShadowSettings>) => void;
  setActiveFilters: (filters: Partial<FilterSettings>) => void;

  // History integration
  recordSnapshot: () => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
}

const defaultBackgroundFill: BackgroundFill = {
  type: 'transparent',
  color: '#ffffff',
  gradient: {
    startColor: '#3b82f6',
    endColor: '#9333ea',
    angle: 135,
  },
};

const defaultDimensions: CanvasDimensions = {
  width: 1080,
  height: 1080,
};

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('everydaycut_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  }
  return 'dark';
};

export const useEditorStore = create<EditorStoreState>((set, get) => ({
  layers: [],
  activeLayerId: null,
  backgroundFill: defaultBackgroundFill,
  aspectRatio: 'original',
  canvasDimensions: defaultDimensions,
  containerDimensions: { width: 800, height: 600 },
  zoom: 100,
  activeTab: 'background',
  editorMode: 'select',
  theme: getInitialTheme(),
  activePreset: null,
  guideOverlay: 'none',
  customDimensions: null,
  targetMaxSizeBytes: null,
  segmentationProgress: {
    status: 'idle',
    progress: 0,
    message: '',
  },

  setLayers: (layers) => set({ layers }),

  addLayer: (layer) => {
    get().recordSnapshot();
    set((state) => ({
      layers: [...state.layers, layer],
      activeLayerId: layer.id,
    }));
  },

  addTextLayer: (customConfig) => {
    get().recordSnapshot();
    const { canvasDimensions, layers } = get();
    const defaultConfig: TextConfig = {
      text: 'SPECIAL OFFER',
      fontSize: 44,
      fontFamily: 'Inter, sans-serif',
      fill: '#ffffff',
      fontWeight: 'bold',
      align: 'center',
      badgeStyle: 'pill',
      badgeColor: '#22c55e',
      badgePadding: 18,
      ...customConfig,
    };

    const newLayer: Layer = {
      id: `text_${Date.now()}`,
      type: 'text',
      name: `Text: ${defaultConfig.text}`,
      textConfig: defaultConfig,
      originalWidth: 340,
      originalHeight: 80,
      x: canvasDimensions.width / 2 - 170,
      y: canvasDimensions.height / 2 - 40,
      width: 340,
      height: 80,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      visible: true,
      shadow: {
        type: 'drop_shadow',
        color: '#000000',
        blur: 15,
        x: 0,
        y: 8,
        opacity: 0.4,
      },
      filters: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        blur: 0,
      },
    };

    set({
      layers: [...layers, newLayer],
      activeLayerId: newLayer.id,
      activeTab: 'text',
    });
  },

  updateActiveTextConfig: (updates) => {
    const { activeLayerId, layers } = get();
    if (!activeLayerId) return;
    const layer = layers.find((l) => l.id === activeLayerId);
    if (!layer || layer.type !== 'text' || !layer.textConfig) return;

    get().recordSnapshot();
    const updatedConfig = { ...layer.textConfig, ...updates };
    get().updateLayer(activeLayerId, {
      textConfig: updatedConfig,
      name: `Text: ${updatedConfig.text.substring(0, 15)}`,
    });
  },

  updateActiveLayer: (updates) => {
    const { activeLayerId } = get();
    if (!activeLayerId) return;
    get().updateLayer(activeLayerId, updates);
  },

  updateLayer: (id, updates) => {
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  },

  removeLayer: (id) => {
    get().recordSnapshot();
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== id),
      activeLayerId: state.activeLayerId === id ? (state.layers[0]?.id ?? null) : state.activeLayerId,
    }));
  },

  setActiveLayerId: (id) => set({ activeLayerId: id }),

  setBackgroundFill: (fill) => {
    get().recordSnapshot();
    set((state) => ({
      backgroundFill: { ...state.backgroundFill, ...fill },
    }));
  },

  setAspectRatio: (aspectRatio) => {
    get().recordSnapshot();
    set({ aspectRatio });
  },

  setCanvasDimensions: (canvasDimensions) => set({ canvasDimensions }),
  setContainerDimensions: (containerDimensions) => set({ containerDimensions }),
  setZoom: (zoom) => set({ zoom: Math.max(10, Math.min(zoom, 500)) }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setEditorMode: (editorMode) => set({ editorMode }),

  setSegmentationProgress: (progress) =>
    set((state) => ({
      segmentationProgress: { ...state.segmentationProgress, ...progress },
    })),

  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      localStorage.setItem('everydaycut_theme', theme);
    }
    set({ theme });
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  setActivePreset: (activePreset) => set({ activePreset }),
  setGuideOverlay: (guideOverlay) => set({ guideOverlay }),

  applyToolPreset: (preset: ToolPresetId) => {
    set({ activePreset: preset });

    switch (preset) {
      case 'crop':
        set({
          guideOverlay: 'none',
          customDimensions: null,
          aspectRatio: '1:1',
          activeTab: 'background',
        });
        break;

      case 'pan_photo':
        set({
          customDimensions: { width: 213, height: 213 },
          targetMaxSizeBytes: 30000, // < 30 KB
          guideOverlay: 'pan_face',
          aspectRatio: '1:1',
          backgroundFill: {
            type: 'solid',
            color: '#ffffff',
            gradient: defaultBackgroundFill.gradient,
          },
          activeTab: 'filters',
        });
        break;

      case 'pan_signature':
        set({
          customDimensions: { width: 400, height: 200 },
          targetMaxSizeBytes: 20000, // < 20 KB
          guideOverlay: 'pan_signature',
          aspectRatio: 'original',
          backgroundFill: {
            type: 'solid',
            color: '#ffffff',
            gradient: defaultBackgroundFill.gradient,
          },
          activeTab: 'filters',
        });
        break;

      case 'passport':
        set({
          customDimensions: { width: 600, height: 600 },
          targetMaxSizeBytes: 100000,
          guideOverlay: 'passport_biometric',
          aspectRatio: '1:1',
          backgroundFill: {
            type: 'solid',
            color: '#ffffff',
            gradient: defaultBackgroundFill.gradient,
          },
          activeTab: 'filters',
        });
        break;

      case 'amazon':
        set({
          customDimensions: { width: 1080, height: 1080 },
          guideOverlay: 'amazon_margin',
          aspectRatio: '1:1',
          backgroundFill: {
            type: 'solid',
            color: '#ffffff',
            gradient: defaultBackgroundFill.gradient,
          },
          activeTab: 'shadow',
        });
        break;

      case 'shopify':
        set({
          customDimensions: { width: 1080, height: 1080 },
          guideOverlay: 'none',
          aspectRatio: '1:1',
          backgroundFill: {
            type: 'solid',
            color: '#f8fafc',
            gradient: defaultBackgroundFill.gradient,
          },
          activeTab: 'shadow',
        });
        break;

      case 'pfp_maker':
        set({
          customDimensions: { width: 1080, height: 1080 },
          guideOverlay: 'circle_pfp',
          aspectRatio: '1:1',
          backgroundFill: {
            type: 'gradient',
            color: '#6366f1',
            gradient: { startColor: '#6366f1', endColor: '#ec4899', angle: 135 },
          },
          activeTab: 'background',
        });
        break;

      case 'instagram_story':
        set({
          customDimensions: { width: 1080, height: 1920 },
          guideOverlay: 'none',
          aspectRatio: '9:16',
          activeTab: 'background',
        });
        break;

      case 'youtube_thumb':
        set({
          customDimensions: { width: 1920, height: 1080 },
          guideOverlay: 'none',
          aspectRatio: '16:9',
          activeTab: 'text',
        });
        break;

      case 'eraser':
        set({
          editorMode: 'eraser',
          guideOverlay: 'none',
        });
        break;

      case 'upscale':
        set({
          activeTab: 'enhance',
          guideOverlay: 'none',
        });
        break;

      case 'badges':
        set({
          activeTab: 'text',
          guideOverlay: 'none',
        });
        break;

      case 'blur_bokeh':
        set({
          activeTab: 'filters',
          guideOverlay: 'none',
        });
        break;

      default:
        set({
          guideOverlay: 'none',
          customDimensions: null,
          targetMaxSizeBytes: null,
        });
    }
  },

  setActiveShadow: (shadowUpdates) => {
    const { activeLayerId, layers } = get();
    if (!activeLayerId) return;
    const layer = layers.find((l) => l.id === activeLayerId);
    if (!layer) return;

    get().recordSnapshot();
    get().updateLayer(activeLayerId, {
      shadow: { ...layer.shadow, ...shadowUpdates },
    });
  },

  setActiveFilters: (filterUpdates) => {
    const { activeLayerId, layers } = get();
    if (!activeLayerId) return;
    const layer = layers.find((l) => l.id === activeLayerId);
    if (!layer) return;

    get().recordSnapshot();
    get().updateLayer(activeLayerId, {
      filters: { ...layer.filters, ...filterUpdates },
    });
  },

  recordSnapshot: () => {
    const { layers, activeLayerId, backgroundFill, aspectRatio, canvasDimensions } = get();
    useHistoryStore.getState().pushState({
      layers: JSON.parse(JSON.stringify(layers)),
      activeLayerId,
      backgroundFill: JSON.parse(JSON.stringify(backgroundFill)),
      aspectRatio,
      canvasDimensions: { ...canvasDimensions },
    });
  },

  undo: () => {
    const { layers, activeLayerId, backgroundFill, aspectRatio, canvasDimensions } = get();
    const currentSnapshot: EditorSnapshot = {
      layers: JSON.parse(JSON.stringify(layers)),
      activeLayerId,
      backgroundFill: JSON.parse(JSON.stringify(backgroundFill)),
      aspectRatio,
      canvasDimensions: { ...canvasDimensions },
    };

    const previous = useHistoryStore.getState().undo(currentSnapshot);
    if (previous) {
      set({
        layers: previous.layers,
        activeLayerId: previous.activeLayerId,
        backgroundFill: previous.backgroundFill,
        aspectRatio: previous.aspectRatio,
        canvasDimensions: previous.canvasDimensions,
      });
    }
  },

  redo: () => {
    const { layers, activeLayerId, backgroundFill, aspectRatio, canvasDimensions } = get();
    const currentSnapshot: EditorSnapshot = {
      layers: JSON.parse(JSON.stringify(layers)),
      activeLayerId,
      backgroundFill: JSON.parse(JSON.stringify(backgroundFill)),
      aspectRatio,
      canvasDimensions: { ...canvasDimensions },
    };

    const next = useHistoryStore.getState().redo(currentSnapshot);
    if (next) {
      set({
        layers: next.layers,
        activeLayerId: next.activeLayerId,
        backgroundFill: next.backgroundFill,
        aspectRatio: next.aspectRatio,
        canvasDimensions: next.canvasDimensions,
      });
    }
  },

  reset: () => {
    set({
      layers: [],
      activeLayerId: null,
      backgroundFill: defaultBackgroundFill,
      aspectRatio: 'original',
      zoom: 100,
      editorMode: 'select',
      activeTab: 'background',
      activePreset: null,
      guideOverlay: 'none',
      customDimensions: null,
      targetMaxSizeBytes: null,
      segmentationProgress: { status: 'idle', progress: 0, message: '' },
    });
    useHistoryStore.getState().clear();
  },
}));

if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__editorStore = useEditorStore;
}

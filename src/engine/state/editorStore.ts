import { create } from 'zustand';
import {
  Layer,
  BackgroundFill,
  AspectRatioPreset,
  CanvasDimensions,
  SegmentationProgress,
  ShadowSettings,
  FilterSettings,
} from './types.ts';
import { EditorSnapshot, useHistoryStore } from './historyStore.ts';

export type ActiveSidebarTab = 'background' | 'shadow' | 'filters' | 'aspect_ratio';

interface EditorStoreState {
  layers: Layer[];
  activeLayerId: string | null;
  backgroundFill: BackgroundFill;
  aspectRatio: AspectRatioPreset;
  canvasDimensions: CanvasDimensions;
  containerDimensions: CanvasDimensions;
  zoom: number; // percentage, e.g. 100
  activeTab: ActiveSidebarTab;
  segmentationProgress: SegmentationProgress;

  // Actions
  setLayers: (layers: Layer[]) => void;
  addLayer: (layer: Layer) => void;
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
  setSegmentationProgress: (progress: Partial<SegmentationProgress>) => void;

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

export const useEditorStore = create<EditorStoreState>((set, get) => ({
  layers: [],
  activeLayerId: null,
  backgroundFill: defaultBackgroundFill,
  aspectRatio: 'original',
  canvasDimensions: defaultDimensions,
  containerDimensions: { width: 800, height: 600 },
  zoom: 100,
  activeTab: 'background',
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

  setSegmentationProgress: (progress) =>
    set((state) => ({
      segmentationProgress: { ...state.segmentationProgress, ...progress },
    })),

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
    });
    useHistoryStore.getState().clear();
  },
}));

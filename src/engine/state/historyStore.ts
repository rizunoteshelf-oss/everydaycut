import { create } from 'zustand';
import { Layer, BackgroundFill, AspectRatioPreset, CanvasDimensions } from './types.ts';

export interface EditorSnapshot {
  layers: Layer[];
  activeLayerId: string | null;
  backgroundFill: BackgroundFill;
  aspectRatio: AspectRatioPreset;
  canvasDimensions: CanvasDimensions;
}

interface HistoryStoreState {
  past: EditorSnapshot[];
  future: EditorSnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  pushState: (state: EditorSnapshot) => void;
  undo: (currentState: EditorSnapshot) => EditorSnapshot | null;
  redo: (currentState: EditorSnapshot) => EditorSnapshot | null;
  clear: () => void;
}

const MAX_HISTORY = 30;

export const useHistoryStore = create<HistoryStoreState>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  pushState: (snapshot: EditorSnapshot) => {
    set((state) => {
      const past = [...state.past, snapshot];
      if (past.length > MAX_HISTORY) {
        past.shift();
      }
      return {
        past,
        future: [],
        canUndo: true,
        canRedo: false,
      };
    });
  },

  undo: (currentState: EditorSnapshot) => {
    const { past, future } = get();
    if (past.length === 0) return null;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const newFuture = [currentState, ...future];

    set({
      past: newPast,
      future: newFuture,
      canUndo: newPast.length > 0,
      canRedo: true,
    });

    return previous;
  },

  redo: (currentState: EditorSnapshot) => {
    const { past, future } = get();
    if (future.length === 0) return null;

    const next = future[0];
    const newFuture = future.slice(1);
    const newPast = [...past, currentState];

    set({
      past: newPast,
      future: newFuture,
      canUndo: true,
      canRedo: newFuture.length > 0,
    });

    return next;
  },

  clear: () => {
    set({
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    });
  },
}));

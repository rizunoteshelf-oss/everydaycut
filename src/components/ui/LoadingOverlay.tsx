import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { useEditorStore } from '../../engine/state/editorStore.ts';

export const LoadingOverlay: React.FC = () => {
  const { segmentationProgress } = useEditorStore();
  const { status, progress, message } = segmentationProgress;

  if (status === 'idle' || status === 'done') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-md p-6 mx-4 bg-panel border border-borderDark rounded-2xl shadow-2xl flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500">
            <Sparkles className="w-8 h-8 animate-pulse text-brand-500" />
          </div>
          <Loader2 className="w-16 h-16 absolute inset-0 animate-spin text-brand-500 opacity-60" />
        </div>

        <h3 className="text-lg font-bold text-white mb-1">
          {status === 'loading_model' ? 'Preparing In-Browser AI' : 'Removing Background...'}
        </h3>
        <p className="text-sm text-zinc-400 mb-5 max-w-xs">{message}</p>

        {/* Progress Bar Container */}
        <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden border border-zinc-700/50 mb-2">
          <div
            className="bg-brand-500 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.max(progress, 5)}%` }}
          />
        </div>

        <div className="flex justify-between w-full text-[11px] text-zinc-500 font-mono">
          <span>{status === 'loading_model' ? 'Quantized RMBG-1.4' : 'WebGPU Accelerated'}</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};

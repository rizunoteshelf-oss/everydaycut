import React from 'react';
import { Loader2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { useEditorStore } from '../../engine/state/editorStore.ts';
import { segmentationClient } from '../../engine/ml/segmentationClient.ts';

export const LoadingOverlay: React.FC = () => {
  const { segmentationProgress, setSegmentationProgress } = useEditorStore();
  const { status, progress, message } = segmentationProgress;

  if (status === 'idle' || status === 'done') {
    return null;
  }

  const handleDismiss = () => {
    segmentationClient.cancel();
    setSegmentationProgress({ status: 'idle', progress: 0, message: '' });
  };

  // Dedicated Error State
  if (status === 'error') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-md p-6 bg-panel border border-red-500/30 rounded-2xl shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-white mb-2">Unable to Process Image</h3>
          <p className="text-sm text-zinc-400 mb-6 max-w-xs">
            {message || 'The neural processor encountered an unexpected condition. Please try again or select another image.'}
          </p>

          <button
            onClick={handleDismiss}
            className="px-6 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-black font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-brand-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            Try Another Photo
          </button>
        </div>
      </div>
    );
  }

  // Active Loading / Processing State
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md p-6 bg-panel border border-borderDark rounded-2xl shadow-2xl flex flex-col items-center text-center">
        <div className="relative mb-4 w-16 h-16 flex items-center justify-center mx-auto">
          <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500">
            <Sparkles className="w-8 h-8 animate-pulse text-brand-500" />
          </div>
          <Loader2 className="w-16 h-16 absolute inset-0 animate-spin text-brand-500 opacity-60 pointer-events-none" />
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
          <span>{status === 'loading_model' ? 'Quantized RMBG-1.4 (INT8)' : 'In-Memory Neural Compute'}</span>
          <span>{progress}%</span>
        </div>

        {status === 'loading_model' && (
          <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-400 text-center">
            <span className="text-brand-400 font-semibold">One-time setup:</span> Neural weights are stored directly in your browser&apos;s local cache. All future cutouts run instantly without re-downloading.
          </div>
        )}

        {/* Dismiss / Cancel button */}
        <button
          onClick={handleDismiss}
          className="mt-4 text-xs text-zinc-400 hover:text-zinc-200 transition-colors py-1 px-3 rounded-lg hover:bg-zinc-800/60"
        >
          Cancel &amp; Return
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { Download, Sparkles, Smartphone, X, Check, Shield } from 'lucide-react';

interface PwaCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
}

export const PwaCelebrationModal: React.FC<PwaCelebrationModalProps> = ({
  isOpen,
  onClose,
  onInstall,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-panel border border-borderDark rounded-2xl p-6 shadow-2xl relative flex flex-col items-center text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Celebration badge */}
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 mb-3 shadow-md">
          <Sparkles className="w-8 h-8 text-brand-500" />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-1">
          Export Successful!
        </span>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
          Install EverydayCut App
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-5 leading-relaxed">
          Add EverydayCut to your home screen for instant 1-tap offline background removal, faster speeds, and full-screen mobile studio editing.
        </p>

        {/* Feature Highlights */}
        <div className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 mb-5 text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <Check className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span>Works 100% offline with zero lag</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <Shield className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span>Private on-device memory processing</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <Smartphone className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span>Full-screen native app experience</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onInstall}
            className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-black font-bold text-xs transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Install EverydayCut App</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Continue Editing
          </button>
        </div>
      </div>
    </div>
  );
};

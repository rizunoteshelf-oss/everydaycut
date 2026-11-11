import React from 'react';
import { X, Sparkles, Cpu, Layers, ShieldCheck } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto bg-panel border border-borderDark rounded-xl p-6 shadow-2xl text-zinc-700 dark:text-zinc-300 transition-colors duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-borderDark">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">About EverydayCut</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 pt-4 text-sm leading-relaxed">
          <p>
            <strong className="text-zinc-900 dark:text-white">EverydayCut</strong> is a privacy-first, 100% free web studio for instant background removal, magic eraser inpainting, and e-commerce product staging. Powered by client-side WebGPU and WebAssembly, all image processing occurs directly in your browser RAM. Your photos are never uploaded to any remote server or cloud storage.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <Cpu className="w-5 h-5 text-brand-500 mb-1" />
              <div className="font-semibold text-zinc-900 dark:text-white text-xs">Local WebGPU &amp; WASM</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">In-browser neural inference powered by local GPU hardware</div>
            </div>
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <Layers className="w-5 h-5 text-brand-500 mb-1" />
              <div className="font-semibold text-zinc-900 dark:text-white text-xs">High-Precision 2D Canvas</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Multi-layer studio with framing, soft shadows &amp; transformers</div>
            </div>
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-brand-500 mb-1" />
              <div className="font-semibold text-zinc-900 dark:text-white text-xs">100% In-Browser Privacy</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Zero cloud uploads; photos never leave your device memory</div>
            </div>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Engineered with modern web standards to provide high-performance computer vision and commercial-grade product photography tools freely to creators, store owners, and digital artists worldwide. Part of the privacy-first ecosystem alongside <a href="https://everydaypdf.me" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">EverydayPDF.me (52+ free PDF tools)</a>.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-borderDark flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-800 dark:text-white bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

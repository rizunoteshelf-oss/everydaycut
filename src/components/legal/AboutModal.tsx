import React from 'react';
import { X, Sparkles, Cpu, Layers, DollarSign } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto bg-panel border border-borderDark rounded-xl p-6 shadow-2xl text-zinc-300">
        <div className="flex items-center justify-between pb-4 border-b border-borderDark">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-bold text-white">About EverydayCut</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 pt-4 text-sm leading-relaxed">
          <p>
            <strong className="text-white">EverydayCut</strong> is a modern, 100% free, zero-server alternative to proprietary photo-editing suites like Pixelcut.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
              <Cpu className="w-5 h-5 text-brand-500 mb-1" />
              <div className="font-semibold text-white text-xs">WebGPU / WASM</div>
              <div className="text-[11px] text-zinc-400 mt-1">In-browser neural inference powered by transformers.js</div>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
              <Layers className="w-5 h-5 text-brand-500 mb-1" />
              <div className="font-semibold text-white text-xs">Konva 2D Engine</div>
              <div className="text-[11px] text-zinc-400 mt-1">Multi-layer studio with framing, shadows & transformers</div>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
              <DollarSign className="w-5 h-5 text-brand-500 mb-1" />
              <div className="font-semibold text-white text-xs">$0 Infrastructure</div>
              <div className="text-[11px] text-zinc-400 mt-1">Zero cloud API costs; fully static edge deployment</div>
            </div>
          </div>

          <p>
            Reverse-engineered and architected using the REA framework to demonstrate that cutting-edge AI computer vision and canvas manipulation can be democratized completely within modern client-side browsers.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-borderDark flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

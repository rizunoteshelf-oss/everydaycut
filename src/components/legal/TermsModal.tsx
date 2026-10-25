import React from 'react';
import { X, FileText } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto bg-panel border border-borderDark rounded-xl p-6 shadow-2xl text-zinc-300">
        <div className="flex items-center justify-between pb-4 border-b border-borderDark">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-bold text-white">Terms of Service</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 pt-4 text-sm leading-relaxed">
          <h3 className="font-semibold text-white">1. Open Source License</h3>
          <p>
            EverydayCut is provided free of charge under the open-source MIT License. You are free to use it for personal, commercial, or educational purposes without payment or subscriptions.
          </p>
          <h3 className="font-semibold text-white">2. Permitted Use</h3>
          <p>
            You retain 100% full ownership, copyright, and commercial rights over all images, cutouts, and exported canvases produced using EverydayCut.
          </p>
          <h3 className="font-semibold text-white">3. Disclaimer of Warranty</h3>
          <p>
            The software is provided &quot;as is&quot;, without warranty of any kind. EverydayCut operates on client hardware and performance is dependent on your device&apos;s WebGPU/CPU capabilities.
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

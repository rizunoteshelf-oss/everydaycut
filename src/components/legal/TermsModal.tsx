import React from 'react';
import { X, FileText } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
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
            <FileText className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Terms of Service</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 pt-4 text-sm leading-relaxed">
          <h3 className="font-semibold text-zinc-900 dark:text-white">1. Free &amp; Open Usage</h3>
          <p>
            EverydayCut is provided free of charge for personal, commercial, and educational purposes. You are free to edit, export, and publish all created assets without subscriptions or licensing fees.
          </p>
          <h3 className="font-semibold text-zinc-900 dark:text-white">2. Full Commercial Ownership</h3>
          <p>
            You retain 100% full ownership, copyright, and commercial rights over all images, cutouts, and exported canvases produced using EverydayCut.
          </p>
          <h3 className="font-semibold text-zinc-900 dark:text-white">3. Client-Side Execution &amp; Warranty</h3>
          <p>
            The software is provided &quot;as is&quot;, without warranty of any kind. All processing runs entirely on client-side WebGPU and WebAssembly hardware.
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

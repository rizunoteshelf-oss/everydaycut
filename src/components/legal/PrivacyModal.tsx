import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
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
            <ShieldCheck className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Privacy Policy</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 pt-4 text-sm leading-relaxed">
          <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-lg text-brand-600 dark:text-brand-400 font-medium text-xs">
            100% In-Browser Privacy Guarantee: Zero Cloud Uploads
          </div>
          <p>
            Unlike commercial AI photo platforms that transmit your private images to remote cloud servers, EverydayCut runs entirely inside your web browser using WebGPU and WebAssembly.
          </p>
          <h3 className="font-semibold text-zinc-900 dark:text-white">1. Local Image Processing</h3>
          <p>
            Your images, photos, and canvas layers are processed strictly inside your device’s local memory (RAM/VRAM). At no point are images or cutouts transmitted across the network, stored on a remote server, or logged.
          </p>
          <h3 className="font-semibold text-zinc-900 dark:text-white">2. Neural Model Weights</h3>
          <p>
            The RMBG-1.4 model weights are stored directly in your browser&apos;s local cache (CacheStorage). Once cached, EverydayCut can operate completely offline without an active internet connection.
          </p>
          <h3 className="font-semibold text-zinc-900 dark:text-white">3. Cookies &amp; Ads</h3>
          <p>
            EverydayCut does not use tracking fingerprinters or invasive trackers. Standard non-intrusive display banners (such as Google AdSense) may be displayed in designated fixed-height slots with zero layout shift.
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

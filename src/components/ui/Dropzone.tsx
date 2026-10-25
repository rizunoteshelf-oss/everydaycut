import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, Shield, Cpu } from 'lucide-react';
import { segmentationClient } from '../../engine/ml/segmentationClient.ts';
import { useEditorStore } from '../../engine/state/editorStore.ts';
import { Layer } from '../../engine/state/types.ts';

// Curated royalty-free samples (Unsplash direct CDN links)
const SAMPLE_IMAGES = [
  {
    name: 'Portrait Model',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=70',
  },
  {
    name: 'Sneakers',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    thumb: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=70',
  },
  {
    name: 'Luxury Watch',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    thumb: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=70',
  },
  {
    name: 'Sports Car',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    thumb: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=150&q=70',
  },
];

interface DropzoneProps {
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenAbout?: () => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onOpenAbout,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { addLayer } = useEditorStore();

  const handleProcessImage = async (fileOrUrl: File | string) => {
    try {
      const result = await segmentationClient.removeBackground(fileOrUrl);
      const newLayer: Layer = {
        id: `layer_${Date.now()}`,
        name: 'Cutout Subject',
        src: result.cutoutUrl,
        originalWidth: result.width,
        originalHeight: result.height,
        x: 0,
        y: 0,
        width: result.width,
        height: result.height,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        visible: true,
        shadow: {
          type: 'none',
          color: '#000000',
          blur: 20,
          x: 0,
          y: 12,
          opacity: 0.35,
        },
        filters: {
          brightness: 0,
          contrast: 0,
          blur: 0,
        },
      };

      addLayer(newLayer);
    } catch (err) {
      console.error('Failed to segment image:', err);
    }
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessImage(file);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleProcessImage(file);
    }
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-6 bg-stage overflow-y-auto">
      {/* Hero Ingestion Box */}
      <div
        onMouseEnter={() => segmentationClient.warmup()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full max-w-xl p-10 border-2 border-dashed rounded-3xl flex flex-col items-center text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
            : 'border-zinc-700/80 bg-panel/80 hover:border-brand-500/80 hover:bg-panel'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileSelected}
        />

        <div className="w-20 h-20 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-brand-500 mb-5 shadow-lg group-hover:scale-110 transition-transform">
          <UploadCloud className="w-10 h-10 text-brand-500" />
        </div>

        <h2 className="text-xl font-bold text-white mb-2">
          Upload an image to remove background
        </h2>
        <p className="text-sm text-zinc-400 max-w-sm mb-6">
          Drag and drop your photo here, or click to browse. Supports PNG, JPG, WEBP up to 4K resolution.
        </p>

        <button className="px-6 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-black font-semibold text-sm transition-all shadow-lg hover:shadow-brand-500/20 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Choose Photo
        </button>

        {/* Feature Badges */}
        <div className="flex items-center gap-6 mt-8 pt-6 border-t border-zinc-800 text-[12px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-brand-500" />
            <span>100% In-Browser AI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-brand-500" />
            <span>Zero Cloud Uploads</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>RMBG-1.4 Quality</span>
          </div>
        </div>
      </div>

      {/* Quick Sample Selector */}
      <div className="mt-8 text-center max-w-xl w-full">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-3">
          Or try with a sample photo
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SAMPLE_IMAGES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleProcessImage(sample.url)}
              className="group relative rounded-xl overflow-hidden border border-zinc-800 hover:border-brand-500 transition-all p-1.5 bg-panel flex flex-col items-center"
            >
              <img
                src={sample.thumb}
                alt={sample.name}
                className="w-full h-20 object-cover rounded-lg group-hover:scale-105 transition-transform"
              />
              <span className="text-[11px] font-medium text-zinc-300 mt-2 truncate w-full">
                {sample.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Legal Links */}
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-zinc-500">
        {onOpenAbout && (
          <button onClick={onOpenAbout} className="hover:text-zinc-300 transition-colors">
            About
          </button>
        )}
        {onOpenPrivacy && (
          <button onClick={onOpenPrivacy} className="hover:text-zinc-300 transition-colors">
            Privacy Policy
          </button>
        )}
        {onOpenTerms && (
          <button onClick={onOpenTerms} className="hover:text-zinc-300 transition-colors">
            Terms of Service
          </button>
        )}
      </div>
    </div>
  );
};

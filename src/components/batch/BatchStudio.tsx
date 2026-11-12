import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  UploadCloud,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { BatchItem, batchManager } from '../../engine/batch/batchManager.ts';

interface BatchStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BatchStudio: React.FC<BatchStudioProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isZipping, setIsZipping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<BatchItem[]>(items);
  itemsRef.current = items;

  // Cleanup object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.previewUrl) {
          try {
            URL.revokeObjectURL(item.previewUrl);
          } catch (_) {}
        }
        if (item.cutoutUrl && item.cutoutUrl.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(item.cutoutUrl);
          } catch (_) {}
        }
      });
    };
  }, []);

  // Keyboard Escape handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFiles = (files: FileList | File[]) => {
    const newItems: BatchItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      newItems.push({
        id: `batch_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        file,
        name: file.name,
        size: file.size,
        previewUrl: URL.createObjectURL(file),
        status: 'pending',
        progress: 0,
      });
    }

    if (newItems.length === 0) return;

    setItems((prev) => {
      const updated = [...prev, ...newItems];
      // Trigger background processing on next tick
      setTimeout(() => {
        batchManager.processQueue(updated, (itemUpdate) => {
          setItems((current) =>
            current.map((item) => (item.id === itemUpdate.id ? itemUpdate : item))
          );
        });
      }, 50);
      return updated;
    });
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDownloadSingle = (item: BatchItem) => {
    if (!item.cutoutBlob) return;
    const cleanName = item.name.replace(/\.[^/.]+$/, '');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(item.cutoutBlob);
    link.download = `${cleanName}_cutout.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleDownloadAllZip = async () => {
    setIsZipping(true);
    try {
      await batchManager.exportAsZip(items, `everydaycut-batch-${Date.now()}.zip`);
    } catch (err) {
      console.error('ZIP export error:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const completedCount = items.filter((i) => i.status === 'done').length;
  const inProgressCount = items.filter((i) => i.status === 'processing').length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl h-[88vh] bg-panel border border-borderDark rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-200 transition-colors duration-200">
        {/* Header Bar */}
        <div className="h-16 px-6 border-b border-borderDark flex items-center justify-between shrink-0 bg-zinc-100 dark:bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-500">
              <Layers className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                Batch Background Remover
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/30">
                  100% In-Browser &bull; Unlimited
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Bulk remove backgrounds from catalog photos and download all as a ZIP archive at $0 cost.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={() => {
                  items.forEach((i) => {
                    URL.revokeObjectURL(i.previewUrl);
                    if (i.cutoutUrl) URL.revokeObjectURL(i.cutoutUrl);
                  });
                  setItems([]);
                }}
                className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                title="Clear all photos"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            /* Empty State Ingestion Box */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-80 border-2 border-dashed border-zinc-300 dark:border-zinc-700/80 hover:border-brand-500 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 flex flex-col items-center justify-center cursor-pointer transition-all text-center p-8 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={onFileInputChange}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-zinc-200 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700/60 flex items-center justify-center text-brand-500 mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8 text-brand-500" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
                Drop multiple product photos here
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
                Select 5, 10, or up to 50 images simultaneously. Every image is processed entirely inside your local device RAM.
              </p>
              <button className="px-5 py-2 rounded-full bg-brand-500 hover:bg-brand-600 text-black font-semibold text-xs transition-all shadow-md flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Select Multiple Photos
              </button>
            </div>
          ) : (
            /* Active Grid of Photos */
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400">Total: <strong className="text-zinc-900 dark:text-white">{items.length}</strong></span>
                  <span className="text-zinc-400 dark:text-zinc-600">&bull;</span>
                  <span className="text-zinc-600 dark:text-zinc-400">Completed: <strong className="text-emerald-600 dark:text-emerald-400">{completedCount}</strong></span>
                  {inProgressCount > 0 && (
                    <>
                      <span className="text-zinc-400 dark:text-zinc-600">&bull;</span>
                      <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin text-brand-500" />
                        Processing...
                      </span>
                    </>
                  )}
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 font-medium transition-colors flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700/60"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add More</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={onFileInputChange}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col justify-between space-y-3 shadow-sm"
                  >
                    <div className="relative w-full h-36 rounded-lg overflow-hidden bg-stage flex items-center justify-center checkerboard-pattern border border-zinc-100 dark:border-zinc-800">
                      <img
                        src={item.cutoutUrl || item.previewUrl}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />

                      {/* Status Badges */}
                      <div className="absolute top-2 right-2">
                        {item.status === 'done' && (
                          <div className="p-1 rounded-full bg-emerald-500 text-white shadow">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                        {item.status === 'processing' && (
                          <div className="p-1 rounded-full bg-brand-500 text-black shadow">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        )}
                        {item.status === 'error' && (
                          <div className="p-1 rounded-full bg-red-500 text-white shadow">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata & Progress */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-zinc-900 dark:text-white truncate max-w-[180px]" title={item.name}>
                          {item.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {(item.size / 1024 / 1024).toFixed(1)}MB
                        </span>
                      </div>

                      {item.status === 'processing' && (
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden mt-2">
                          <div
                            className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(item.progress, 10)}%` }}
                          />
                        </div>
                      )}

                      {item.status === 'done' && (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Cutout Ready</span>
                          <button
                            onClick={() => handleDownloadSingle(item)}
                            className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px] text-zinc-800 dark:text-zinc-200 font-medium transition-colors flex items-center gap-1 border border-zinc-200 dark:border-zinc-700"
                          >
                            <Download className="w-3 h-3 text-brand-500" />
                            <span>PNG</span>
                          </button>
                        </div>
                      )}

                      {item.status === 'error' && (
                        <span className="text-[11px] text-red-500">Failed to segment</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="h-16 px-6 border-t border-borderDark flex items-center justify-between shrink-0 bg-zinc-100 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>Zero server compute cost &bull; 100% In-Browser RAM</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Back to Studio
            </button>

            <button
              onClick={handleDownloadAllZip}
              disabled={completedCount === 0 || isZipping}
              className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-black font-semibold text-xs transition-all shadow-md flex items-center gap-2"
            >
              {isZipping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Packaging ZIP...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download All ({completedCount}) as .ZIP</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

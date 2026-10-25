import React from 'react';

interface AdBannerSlotProps {
  placement: 'leaderboard' | 'sidebar';
}

export const AdBannerSlot: React.FC<AdBannerSlotProps> = ({ placement }) => {
  if (placement === 'leaderboard') {
    return (
      <aside
        aria-label="Advertisement"
        className="w-full h-[90px] min-h-[90px] max-h-[90px] bg-panel border-t border-borderDark flex items-center justify-center shrink-0 z-20 overflow-hidden"
      >
        <div className="w-[728px] max-w-full h-[90px] flex flex-col items-center justify-center border border-dashed border-zinc-700/60 rounded text-xs text-zinc-500 bg-zinc-900/40">
          <span className="font-semibold tracking-wider text-[10px] text-zinc-600 uppercase">Sponsor Space</span>
          <span className="text-zinc-400 text-xs">728x90 Zero-CLS Ad Unit (AdSense / Mediavine Ready)</span>
        </div>
      </aside>
    );
  }

  // 300x250 medium rectangle for sidebar
  return (
    <aside
      aria-label="Advertisement"
      className="w-[300px] h-[250px] min-w-[300px] min-h-[250px] mx-auto my-4 bg-zinc-900/60 border border-dashed border-zinc-700/60 rounded flex flex-col items-center justify-center text-xs text-zinc-500 shrink-0"
    >
      <span className="font-semibold tracking-wider text-[10px] text-zinc-600 uppercase">Sponsor Space</span>
      <span className="text-zinc-400 text-xs mt-1">300x250 Static Banner Unit</span>
      <span className="text-zinc-500 text-[11px] mt-2">Zero Layout Shift Protected</span>
    </aside>
  );
};

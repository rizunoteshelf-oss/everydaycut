import React from 'react';

interface AdBannerSlotProps {
  placement: 'leaderboard' | 'sidebar';
}

export const AdBannerSlot: React.FC<AdBannerSlotProps> = ({ placement }) => {
  if (placement === 'leaderboard') {
    return (
      <aside
        aria-label="Advertisement"
        className="w-full h-[60px] md:h-[90px] min-h-[60px] md:min-h-[90px] max-h-[60px] md:max-h-[90px] bg-panel border-t border-borderDark flex items-center justify-center shrink-0 z-20 overflow-hidden transition-colors duration-200"
      >
        {/* Desktop 728x90 Ad Unit */}
        <div className="hidden md:flex w-[728px] max-w-full h-[80px] my-1 flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-700/60 rounded text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-900/40">
          <span className="font-semibold tracking-wider text-[10px] text-zinc-500 dark:text-zinc-600 uppercase">
            Sponsor Space
          </span>
          <span className="text-zinc-600 dark:text-zinc-400 text-xs">
            728×90 Zero-CLS Ad Unit (AdSense / SSP Ready)
          </span>
        </div>

        {/* Mobile 320x50 Anchor Ad Unit */}
        <div className="flex md:hidden w-[320px] max-w-[95vw] h-[50px] my-1 flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-700/60 rounded text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-900/40">
          <span className="font-semibold tracking-wider text-[9px] text-zinc-500 dark:text-zinc-600 uppercase">
            Sponsor Space
          </span>
          <span className="text-zinc-600 dark:text-zinc-400 text-[11px]">
            320×50 Mobile Banner (AdSense Ready)
          </span>
        </div>
      </aside>
    );
  }

  // 300x250 medium rectangle for sidebar
  return (
    <aside
      aria-label="Advertisement"
      className="w-[300px] h-[250px] min-w-[300px] min-h-[250px] mx-auto my-4 bg-zinc-50 dark:bg-zinc-900/60 border border-dashed border-zinc-300 dark:border-zinc-700/60 rounded flex flex-col items-center justify-center text-xs text-zinc-500 shrink-0"
    >
      <span className="font-semibold tracking-wider text-[10px] text-zinc-500 dark:text-zinc-600 uppercase">
        Sponsor Space
      </span>
      <span className="text-zinc-600 dark:text-zinc-400 text-xs mt-1">300×250 Static Banner Unit</span>
      <span className="text-zinc-400 dark:text-zinc-500 text-[11px] mt-2">Zero Layout Shift Protected</span>
    </aside>
  );
};

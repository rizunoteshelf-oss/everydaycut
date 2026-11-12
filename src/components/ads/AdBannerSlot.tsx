import React, { useEffect, useRef } from 'react';

interface AdBannerSlotProps {
  placement: 'leaderboard' | 'sidebar';
}

const ADSENSE_CLIENT_ID = 'ca-pub-5975753455053538';

const isNumericSlot = (val?: string): boolean => Boolean(val && /^\d{5,16}$/.test(val.trim()));

export const AdBannerSlot: React.FC<AdBannerSlotProps> = ({ placement }) => {
  const adRef = useRef<HTMLModElement>(null);
  const isPushed = useRef(false);

  const desktopTopSlot = import.meta.env.VITE_ADSENSE_SLOT_TOP;
  const mobileTopSlot = import.meta.env.VITE_ADSENSE_SLOT_MOBILE;
  const sidebarSlot = import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR;

  const hasDesktopTop = isNumericSlot(desktopTopSlot);
  const hasMobileTop = isNumericSlot(mobileTopSlot);
  const hasSidebar = isNumericSlot(sidebarSlot);

  useEffect(() => {
    if (isPushed.current) return;
    const shouldPush =
      (placement === 'leaderboard' && (hasDesktopTop || hasMobileTop)) ||
      (placement === 'sidebar' && hasSidebar);

    if (!shouldPush) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const adsbygoogle = ((window as any).adsbygoogle = (window as any).adsbygoogle || []);
      adsbygoogle.push({});
      isPushed.current = true;
    } catch (err) {
      // Graceful fallback if ad-blocked or offline
      console.debug('[AdSense] Slot initialization:', err);
    }
  }, [placement, hasDesktopTop, hasMobileTop, hasSidebar]);

  if (placement === 'leaderboard') {
    return (
      <aside
        aria-label="Advertisement"
        className="w-full h-[60px] md:h-[90px] min-h-[60px] md:min-h-[90px] max-h-[60px] md:max-h-[90px] bg-panel border-t border-borderDark flex items-center justify-center shrink-0 z-20 overflow-hidden transition-colors duration-200 mt-2"
      >
        {/* Desktop 728x90 Ad Unit */}
        <div className="hidden md:flex w-[728px] max-w-full h-[90px] items-center justify-center relative overflow-hidden">
          {hasDesktopTop ? (
            <ins
              ref={adRef}
              className="adsbygoogle"
              style={{ display: 'inline-block', width: '728px', height: '90px' }}
              data-ad-client={ADSENSE_CLIENT_ID}
              data-ad-slot={desktopTopSlot!.trim()}
              data-ad-format="horizontal"
              data-full-width-responsive="false"
            />
          ) : (
            <div className="w-full h-full border border-dashed border-zinc-200 dark:border-zinc-800 rounded flex items-center justify-center text-[11px] text-zinc-400 dark:text-zinc-600 select-none">
              <span>Sponsor Placement (728×90 Zero-CLS Container)</span>
            </div>
          )}
        </div>

        {/* Mobile 320x50 Anchor Ad Unit */}
        <div className="flex md:hidden w-[320px] max-w-[95vw] h-[50px] items-center justify-center relative overflow-hidden">
          {hasMobileTop ? (
            <ins
              className="adsbygoogle"
              style={{ display: 'inline-block', width: '320px', height: '50px' }}
              data-ad-client={ADSENSE_CLIENT_ID}
              data-ad-slot={mobileTopSlot!.trim()}
              data-ad-format="horizontal"
              data-full-width-responsive="false"
            />
          ) : (
            <div className="w-full h-full border border-dashed border-zinc-200 dark:border-zinc-800 rounded flex items-center justify-center text-[10px] text-zinc-400 dark:text-zinc-600 select-none">
              <span>Sponsor Placement (320×50)</span>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // 300x250 medium rectangle for desktop sidebar with 40px buffer
  return (
    <aside
      aria-label="Advertisement"
      className="w-[300px] h-[250px] min-w-[300px] min-h-[250px] mx-auto my-6 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-center relative overflow-hidden shrink-0 shadow-sm"
    >
      {hasSidebar ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '300px', height: '250px' }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={sidebarSlot!.trim()}
          data-ad-format="rectangle"
          data-full-width-responsive="false"
        />
      ) : (
        <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center text-zinc-400 dark:text-zinc-600 border border-dashed border-zinc-200 dark:border-zinc-800/80 rounded-lg select-none">
          <span className="text-xs font-semibold uppercase tracking-wider mb-1">EverydayCut Network</span>
          <span className="text-[11px] max-w-[220px]">
            100% Free &amp; Private On-Device Photo Utilities • 0 Pixel Uploads
          </span>
        </div>
      )}
    </aside>
  );
};

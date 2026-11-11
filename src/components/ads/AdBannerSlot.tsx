import React, { useEffect, useRef } from 'react';

interface AdBannerSlotProps {
  placement: 'leaderboard' | 'sidebar';
}

const ADSENSE_CLIENT_ID = 'ca-pub-5975753455053538';

export const AdBannerSlot: React.FC<AdBannerSlotProps> = ({ placement }) => {
  const adRef = useRef<HTMLModElement>(null);
  const isPushed = useRef(false);

  useEffect(() => {
    if (isPushed.current) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const adsbygoogle = ((window as any).adsbygoogle = (window as any).adsbygoogle || []);
      adsbygoogle.push({});
      isPushed.current = true;
    } catch (err) {
      // Graceful fallback if ad-blocked or offline
      console.debug('[AdSense] Slot initialization:', err);
    }
  }, []);

  if (placement === 'leaderboard') {
    return (
      <aside
        aria-label="Advertisement"
        className="w-full h-[60px] md:h-[90px] min-h-[60px] md:min-h-[90px] max-h-[60px] md:max-h-[90px] bg-panel border-t border-borderDark flex items-center justify-center shrink-0 z-20 overflow-hidden transition-colors duration-200"
      >
        {/* Desktop 728x90 Ad Unit */}
        <div className="hidden md:flex w-[728px] max-w-full h-[90px] items-center justify-center relative overflow-hidden">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'inline-block', width: '728px', height: '90px' }}
            data-ad-client={ADSENSE_CLIENT_ID}
            data-ad-slot="leaderboard-desktop"
            data-ad-format="horizontal"
            data-full-width-responsive="false"
          />
        </div>

        {/* Mobile 320x50 Anchor Ad Unit */}
        <div className="flex md:hidden w-[320px] max-w-[95vw] h-[50px] items-center justify-center relative overflow-hidden">
          <ins
            className="adsbygoogle"
            style={{ display: 'inline-block', width: '320px', height: '50px' }}
            data-ad-client={ADSENSE_CLIENT_ID}
            data-ad-slot="banner-mobile"
            data-ad-format="horizontal"
            data-full-width-responsive="false"
          />
        </div>
      </aside>
    );
  }

  // 300x250 medium rectangle for desktop sidebar
  return (
    <aside
      aria-label="Advertisement"
      className="w-[300px] h-[250px] min-w-[300px] min-h-[250px] mx-auto my-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-center relative overflow-hidden shrink-0 shadow-sm"
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '300px', height: '250px' }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot="sidebar-rectangle"
        data-ad-format="rectangle"
        data-full-width-responsive="false"
      />
    </aside>
  );
};

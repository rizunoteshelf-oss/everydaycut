import React, { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';

interface CookieConsentBannerProps {
  onOpenPrivacy: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenPrivacy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('everydaycut_cookie_consent');
      if (!consent) {
        setIsVisible(true);
      }
    } catch (_) {
      // In private browsing mode or storage disabled
    }
  }, []);

  const handleConsent = (status: 'accepted' | 'declined') => {
    try {
      localStorage.setItem('everydaycut_cookie_consent', status);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gtag = (window as any).gtag;
      if (typeof gtag === 'function') {
        const flag = status === 'accepted' ? 'granted' : 'denied';
        gtag('consent', 'update', {
          ad_storage: flag,
          analytics_storage: flag,
          ad_user_data: flag,
          ad_personalization: flag,
        });
      }
    } catch (_) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 p-4 bg-panel border border-borderDark rounded-2xl shadow-2xl text-zinc-800 dark:text-zinc-200 text-xs space-y-3 transition-colors duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-500 shrink-0">
          <Cookie className="w-4 h-4 text-brand-500" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-zinc-900 dark:text-white text-xs flex items-center gap-1.5">
            Privacy &amp; Cookie Consent
          </h3>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
            EverydayCut processes all photos 100% locally in your browser. We use privacy-compliant cookies to serve non-intrusive ads and support our free utility.{' '}
            <button
              onClick={onOpenPrivacy}
              className="text-brand-600 dark:text-brand-400 font-semibold underline hover:text-brand-500"
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-borderDark/60">
        <button
          onClick={() => handleConsent('declined')}
          className="min-h-[44px] px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-xs transition-colors"
        >
          Reject Non-Essential
        </button>
        <button
          onClick={() => handleConsent('accepted')}
          className="min-h-[44px] px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-black font-bold text-xs transition-colors shadow-sm"
        >
          Accept All
        </button>
      </div>
    </aside>
  );
};

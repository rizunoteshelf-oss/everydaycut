import React, { useRef, useState, useEffect, useCallback, Suspense } from 'react';
import Konva from 'konva';
import { Sliders } from 'lucide-react';
import { useEditorStore } from './engine/state/editorStore.ts';
import { ToolPresetId } from './engine/state/types.ts';
import { HeaderBar } from './components/header/HeaderBar.tsx';
import { Sidebar } from './components/sidebar/Sidebar.tsx';
import { EditorCanvas } from './engine/canvas/EditorCanvas.tsx';
import { Dropzone } from './components/ui/Dropzone.tsx';
import { HomeHub } from './components/home/HomeHub.tsx';
import { LoadingOverlay } from './components/ui/LoadingOverlay.tsx';
import { AdBannerSlot } from './components/ads/AdBannerSlot.tsx';
import { SEOHead } from './seo/SEOHead.tsx';
import { getPresetBySlug, getSEOEntryByPreset } from './seo/seoData.ts';
import { usePwaInstall } from './components/pwa/usePwaInstall.ts';
import { CookieConsentBanner } from './components/legal/CookieConsentBanner.tsx';

// Code-split heavy modal/feature modules to reduce initial JS payload
const BatchStudio = React.lazy(() =>
  import('./components/batch/BatchStudio.tsx').then((m) => ({ default: m.BatchStudio }))
);
const PrivacyModal = React.lazy(() =>
  import('./components/legal/PrivacyModal.tsx').then((m) => ({ default: m.PrivacyModal }))
);
const TermsModal = React.lazy(() =>
  import('./components/legal/TermsModal.tsx').then((m) => ({ default: m.TermsModal }))
);
const AboutModal = React.lazy(() =>
  import('./components/legal/AboutModal.tsx').then((m) => ({ default: m.AboutModal }))
);
const PwaCelebrationModal = React.lazy(() =>
  import('./components/pwa/PwaCelebrationModal.tsx').then((m) => ({ default: m.PwaCelebrationModal }))
);

export const App: React.FC = () => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const { layers, reset, activePreset, setActivePreset, applyToolPreset } = useEditorStore();

  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isEditorActive = layers.length > 0;
  const isToolRoute = activePreset !== null;

  // Navigation helpers keeping URL, store, and scroll position synchronized
  const navigateToTool = useCallback(
    (presetId: ToolPresetId) => {
      if (layers.length > 0) {
        reset();
      }
      setActivePreset(presetId);
      applyToolPreset(presetId);
      const seo = getSEOEntryByPreset(presetId);
      if (seo.slug) {
        const targetPath = `/${seo.slug}`;
        if (window.location.pathname.replace(/\/+$/, '') !== targetPath) {
          window.history.pushState(null, '', targetPath);
        }
      }
      window.scrollTo(0, 0);
    },
    [layers.length, reset, setActivePreset, applyToolPreset]
  );

  const navigateHome = useCallback(() => {
    if (layers.length > 0) {
      reset();
    }
    setActivePreset(null);
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
    window.scrollTo(0, 0);
  }, [layers.length, reset, setActivePreset]);

  // Reset scroll position and lock document scroll strictly in Editor View
  useEffect(() => {
    window.scrollTo(0, 0);
    if (isEditorActive) {
      document.documentElement.classList.add('overflow-hidden');
      document.body.classList.add('overflow-hidden');
    } else {
      document.documentElement.classList.remove('overflow-hidden');
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.documentElement.classList.remove('overflow-hidden');
      document.body.classList.remove('overflow-hidden');
    };
  }, [isEditorActive]);

  // Progressive Web App (PWA) Install Management
  const {
    isInstallable,
    isInstalled,
    promptInstall,
    showCelebration,
    closeCelebration,
    triggerExportCelebration,
  } = usePwaInstall();

  // Sync incoming route (History API clean path or legacy hash) on mount and popstate
  useEffect(() => {
    const syncFromRoute = () => {
      const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';

      // 1. Check clean path first (e.g. /background-remover or /background-remover/)
      if (normalizedPath !== '/') {
        const preset = getPresetBySlug(normalizedPath);
        if (preset) {
          setActivePreset(preset);
          applyToolPreset(preset);
          return;
        }
      }

      // 2. Fallback to legacy hash (e.g. #/background-remover)
      const hash = window.location.hash;
      if (hash) {
        const preset = getPresetBySlug(hash);
        if (preset) {
          setActivePreset(preset);
          applyToolPreset(preset);
          const cleanSlug = hash.replace(/^#?\/?|\/+$/g, '').trim();
          window.history.replaceState(null, '', `/${cleanSlug}`);
          return;
        }
      }

      // 3. Explicit root / -> clear activePreset so EverydayCut Homepage renders cleanly
      setActivePreset(null);
    };

    syncFromRoute();
    window.addEventListener('popstate', syncFromRoute);
    window.addEventListener('hashchange', syncFromRoute);
    return () => {
      window.removeEventListener('popstate', syncFromRoute);
      window.removeEventListener('hashchange', syncFromRoute);
    };
  }, [setActivePreset, applyToolPreset]);

  return (
    <div
      className={
        isEditorActive
          ? 'fixed inset-0 flex flex-col w-full bg-stage text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans transition-colors duration-200'
          : 'flex flex-col w-full min-h-dvh bg-stage text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200'
      }
    >
      {/* Dynamic SEO Meta, OpenGraph, Canonical & Schema.org JSON-LD */}
      <SEOHead activeToolPreset={activePreset} />

      {/* Top Studio Header */}
      <HeaderBar
        stageRef={stageRef}
        onNewImage={reset}
        onNavigateHome={navigateHome}
        onSelectTool={navigateToTool}
        onOpenBatch={() => setBatchOpen(true)}
        onExportSuccess={triggerExportCelebration}
        onInstallPwa={promptInstall}
        isPwaInstallable={isInstallable}
        isPwaInstalled={isInstalled}
      />

      {/* Main Content Area: Home Hub (/) vs Tool Workspace (/<slug>) vs Locked Canvas Editor */}
      <div
        className={
          isEditorActive
            ? 'flex-1 min-h-0 flex w-full overflow-hidden relative'
            : 'flex-1 flex flex-col w-full relative'
        }
      >
        {!isEditorActive ? (
          isToolRoute ? (
            <Dropzone
              onOpenPrivacy={() => setPrivacyOpen(true)}
              onOpenTerms={() => setTermsOpen(true)}
              onOpenAbout={() => setAboutOpen(true)}
              onOpenBatch={() => setBatchOpen(true)}
              onSelectTool={navigateToTool}
              onBackHome={navigateHome}
            />
          ) : (
            <HomeHub
              onSelectTool={navigateToTool}
              onOpenBatch={() => setBatchOpen(true)}
              onOpenPrivacy={() => setPrivacyOpen(true)}
              onOpenTerms={() => setTermsOpen(true)}
              onOpenAbout={() => setAboutOpen(true)}
            />
          )
        ) : (
          <>
            <EditorCanvas stageRef={stageRef} />
            <Sidebar
              stageRef={stageRef}
              onOpenPrivacy={() => setPrivacyOpen(true)}
              onOpenTerms={() => setTermsOpen(true)}
              onOpenAbout={() => setAboutOpen(true)}
              isOpenOnMobile={mobileSidebarOpen}
              onCloseMobile={() => setMobileSidebarOpen(false)}
              onInstallPwa={promptInstall}
              isPwaInstallable={isInstallable}
              isPwaInstalled={isInstalled}
            />

            {/* Mobile Controls Trigger Button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden fixed bottom-[72px] right-4 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-black font-bold text-xs shadow-xl active:scale-95 transition-all cursor-pointer"
              aria-label="Open Studio Controls"
            >
              <Sliders className="w-4 h-4" />
              <span>Studio Controls</span>
            </button>
          </>
        )}
      </div>

      {/* Fixed Zero-CLS Leaderboard Ad (728x90 desktop / 320x50 mobile) */}
      <AdBannerSlot placement="leaderboard" />

      {/* Background Segmentation Progress Modal */}
      <LoadingOverlay />

      {/* Lazy Modals wrapped in Suspense */}
      <Suspense fallback={null}>
        {batchOpen && <BatchStudio isOpen={batchOpen} onClose={() => setBatchOpen(false)} />}
        {showCelebration && (
          <PwaCelebrationModal
            isOpen={showCelebration}
            onClose={closeCelebration}
            onInstall={promptInstall}
          />
        )}
        {privacyOpen && <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />}
        {termsOpen && <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />}
        {aboutOpen && <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />}
      </Suspense>

      {/* Lightweight GDPR/ePrivacy & Consent Mode v2 Banner */}
      <CookieConsentBanner onOpenPrivacy={() => setPrivacyOpen(true)} />
    </div>
  );
};

export default App;

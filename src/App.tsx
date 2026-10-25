import React, { useRef, useState, useEffect } from 'react';
import Konva from 'konva';
import { Sliders } from 'lucide-react';
import { useEditorStore } from './engine/state/editorStore.ts';
import { HeaderBar } from './components/header/HeaderBar.tsx';
import { Sidebar } from './components/sidebar/Sidebar.tsx';
import { EditorCanvas } from './engine/canvas/EditorCanvas.tsx';
import { Dropzone } from './components/ui/Dropzone.tsx';
import { LoadingOverlay } from './components/ui/LoadingOverlay.tsx';
import { AdBannerSlot } from './components/ads/AdBannerSlot.tsx';
import { PrivacyModal } from './components/legal/PrivacyModal.tsx';
import { TermsModal } from './components/legal/TermsModal.tsx';
import { AboutModal } from './components/legal/AboutModal.tsx';
import { BatchStudio } from './components/batch/BatchStudio.tsx';
import { SEOHead } from './seo/SEOHead.tsx';
import { getPresetBySlug, getSEOEntryByPreset } from './seo/seoData.ts';
import { usePwaInstall } from './components/pwa/usePwaInstall.ts';
import { PwaCelebrationModal } from './components/pwa/PwaCelebrationModal.tsx';

export const App: React.FC = () => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const { layers, reset, activePreset, setActivePreset } = useEditorStore();

  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Progressive Web App (PWA) Install Management
  const {
    isInstallable,
    isInstalled,
    promptInstall,
    showCelebration,
    closeCelebration,
    triggerExportCelebration,
  } = usePwaInstall();

  // Sync incoming route / hash on mount and hashchange
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const preset = getPresetBySlug(hash);
        if (preset) {
          setActivePreset(preset);
        }
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [setActivePreset]);

  // Sync URL hash when active preset changes in editor
  useEffect(() => {
    const seo = getSEOEntryByPreset(activePreset);
    if (seo) {
      const targetHash = `#/${seo.slug}`;
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, '', targetHash);
      }
    }
  }, [activePreset]);

  return (
    <div className="flex flex-col w-screen h-screen bg-stage text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans transition-colors duration-200">
      {/* Dynamic SEO Meta, OpenGraph, Canonical & Schema.org JSON-LD */}
      <SEOHead activeToolPreset={activePreset} />

      {/* Top Studio Header */}
      <HeaderBar
        stageRef={stageRef}
        onNewImage={reset}
        onOpenBatch={() => setBatchOpen(true)}
        onExportSuccess={triggerExportCelebration}
        onInstallPwa={promptInstall}
        isPwaInstallable={isInstallable}
        isPwaInstalled={isInstalled}
      />

      {/* Main Studio Viewport & Sidebar */}
      <div className="flex-1 min-h-0 flex w-full overflow-hidden relative">
        {layers.length === 0 ? (
          <Dropzone
            onOpenPrivacy={() => setPrivacyOpen(true)}
            onOpenTerms={() => setTermsOpen(true)}
            onOpenAbout={() => setAboutOpen(true)}
            onOpenBatch={() => setBatchOpen(true)}
          />
        ) : (
          <>
            <EditorCanvas stageRef={stageRef} />
            <Sidebar
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

      {/* Batch Cutout Studio Modal */}
      <BatchStudio isOpen={batchOpen} onClose={() => setBatchOpen(false)} />

      {/* PWA Post-Export Celebration Modal */}
      <PwaCelebrationModal
        isOpen={showCelebration}
        onClose={closeCelebration}
        onInstall={promptInstall}
      />

      {/* Compliance & Info Modals */}
      <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
};

export default App;

import React, { useRef, useState } from 'react';
import Konva from 'konva';
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

export const App: React.FC = () => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const { layers, reset } = useEditorStore();

  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="flex flex-col w-screen h-screen bg-stage text-zinc-100 overflow-hidden font-sans">
      {/* Top Studio Header */}
      <HeaderBar stageRef={stageRef} onNewImage={reset} />

      {/* Main Studio Viewport & Sidebar */}
      <div className="flex-1 flex w-full h-[calc(100vh-146px)] overflow-hidden">
        {layers.length === 0 ? (
          <Dropzone
            onOpenPrivacy={() => setPrivacyOpen(true)}
            onOpenTerms={() => setTermsOpen(true)}
            onOpenAbout={() => setAboutOpen(true)}
          />
        ) : (
          <>
            <EditorCanvas stageRef={stageRef} />
            <Sidebar
              onOpenPrivacy={() => setPrivacyOpen(true)}
              onOpenTerms={() => setTermsOpen(true)}
              onOpenAbout={() => setAboutOpen(true)}
            />
          </>
        )}
      </div>

      {/* Fixed 90px Bottom Zero-CLS Leaderboard Ad */}
      <AdBannerSlot placement="leaderboard" />

      {/* Background Segmentation Progress Modal */}
      <LoadingOverlay />

      {/* Compliance & Info Modals */}
      <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
};

export default App;

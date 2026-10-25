import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePwaInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (installed PWA)
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowCelebration(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      // Fallback for iOS Safari which doesn't support beforeinstallprompt
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: boolean }).MSStream;
      if (isIOS) {
        alert('To install EverydayCut on iOS:\n1. Tap the Share button at the bottom of Safari (square with arrow)\n2. Scroll down and tap "Add to Home Screen"');
      }
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
    setShowCelebration(false);
  };

  const triggerExportCelebration = () => {
    // Only trigger if not already installed
    if (!isInstalled) {
      setShowCelebration(true);
    }
  };

  return {
    isInstallable,
    isInstalled,
    promptInstall,
    showCelebration,
    closeCelebration: () => setShowCelebration(false),
    triggerExportCelebration,
  };
};

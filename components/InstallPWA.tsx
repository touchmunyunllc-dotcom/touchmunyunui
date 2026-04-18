'use client';

import { useEffect, useState } from 'react';
import { notificationService } from '@/services/notificationService';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      notificationService.success('App installed successfully!');
    } else {
      notificationService.info('App installation cancelled');
    }

    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  if (!showInstallButton) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className="bg-primary/95 backdrop-blur-xl rounded-2xl shadow-glass-lg p-4 border-2 border-foreground/20 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-button/90 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-button/30 shadow-glass">
            <svg
              className="w-6 h-6 text-button-text"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground mb-1">Install TouchMunyun</h3>
            <p className="text-sm text-foreground/70 mb-3">
              Install our app for a better experience and offline access
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-button text-button-text font-semibold py-2 px-4 rounded-lg hover:bg-button-200 transition-all duration-200 text-sm shadow-glass hover:shadow-xl border border-button-300/50"
              >
                Install
              </button>
              <button
                onClick={() => setShowInstallButton(false)}
                className="px-4 py-2 text-foreground/70 hover:text-foreground font-medium text-sm transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


'use client';

import { useEffect, useState } from 'react';
import { notificationService } from '@/services/notificationService';

export const UpdateAvailable: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setUpdateAvailable(true);
      });

      // Check for updates periodically
      const checkForUpdates = () => {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        }
      };

      // Check every 5 minutes
      const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-fade-in">
      <div className="bg-primary/95 backdrop-blur-xl rounded-2xl shadow-glass-lg p-4 border-2 border-foreground/20 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gold-500/90 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-gold-500/30 shadow-glass">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground mb-1">Update Available</h3>
            <p className="text-sm text-foreground/70 mb-3">
              A new version of the app is available. Refresh to get the latest features.
            </p>
            <button
              onClick={handleUpdate}
              className="w-full bg-gold-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gold-600 transition-all duration-200 text-sm shadow-glass hover:shadow-xl border border-gold-400/50"
            >
              Update Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


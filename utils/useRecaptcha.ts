import { useCallback, useEffect } from 'react';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

let scriptLoaded = false;
let scriptLoading = false;

function loadRecaptchaScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (!RECAPTCHA_SITE_KEY) return Promise.resolve();

  return new Promise((resolve, reject) => {
    if (scriptLoading) {
      // Wait for existing load
      const check = setInterval(() => {
        if (scriptLoaded) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      return;
    }

    scriptLoading = true;
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded = true;
      scriptLoading = false;
      resolve();
    };
    script.onerror = () => {
      scriptLoading = false;
      reject(new Error('Failed to load reCAPTCHA script'));
    };
    document.head.appendChild(script);
  });
}

/**
 * Hook for Google reCAPTCHA v3.
 * Returns an executeRecaptcha function that generates a token for the given action.
 * 
 * If reCAPTCHA is not configured (no site key), returns null tokens gracefully
 * so the app works in development without reCAPTCHA keys.
 */
export function useRecaptcha() {
  useEffect(() => {
    if (RECAPTCHA_SITE_KEY) {
      loadRecaptchaScript().catch(console.error);
    }
  }, []);

  const executeRecaptcha = useCallback(async (action: string): Promise<string | null> => {
    if (!RECAPTCHA_SITE_KEY) {
      // reCAPTCHA not configured — return null (backend will skip verification too)
      return null;
    }

    try {
      await loadRecaptchaScript();
      return new Promise((resolve) => {
        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
            resolve(token);
          } catch {
            console.error('reCAPTCHA execute failed');
            resolve(null);
          }
        });
      });
    } catch {
      console.error('reCAPTCHA not available');
      return null;
    }
  }, []);

  return { executeRecaptcha, isReady: !!RECAPTCHA_SITE_KEY };
}

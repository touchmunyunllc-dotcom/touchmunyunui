function isLocalDevHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

/** Remove production PWA workers on localhost so Next dev HMR (`*.hot-update.json`) is not cached. */
export async function unregisterServiceWorkersInDev(): Promise<void> {
  if (!isLocalDevHost() || !('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  } catch {
    // ignore — dev should still run without SW cleanup
  }
}

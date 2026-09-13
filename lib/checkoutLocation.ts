export interface CheckoutGeo {
  checkoutLatitude?: number;
  checkoutLongitude?: number;
}

/** Do not block checkout longer than this waiting for GPS (geocoding is separate and never blocks orders). */
const CHECKOUT_GEO_MAX_WAIT_MS = 2000;

/** Best-effort device location when the customer places an order (optional; never required to checkout). */
export async function captureCheckoutGeo(): Promise<CheckoutGeo> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return {};
  }

  const positionPromise = new Promise<CheckoutGeo>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          checkoutLatitude: position.coords.latitude,
          checkoutLongitude: position.coords.longitude,
        });
      },
      () => resolve({}),
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 120_000,
      }
    );
  });

  const giveUpPromise = new Promise<CheckoutGeo>((resolve) => {
    setTimeout(() => resolve({}), CHECKOUT_GEO_MAX_WAIT_MS);
  });

  return Promise.race([positionPromise, giveUpPromise]);
}

export function mapsLink(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

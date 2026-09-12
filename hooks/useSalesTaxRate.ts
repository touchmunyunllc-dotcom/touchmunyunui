import { useEffect, useState } from 'react';
import { storeSettingsService } from '@/services/storeSettingsService';

const DEFAULT_RATE = 0.1;

export function useSalesTaxRate() {
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    storeSettingsService
      .getSalesTax()
      .then((settings) => {
        if (!cancelled) {
          setRate(settings.salesTaxRate);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRate(DEFAULT_RATE);
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { rate, percent: Math.round(rate * 1000) / 10, loaded };
}

export function estimateTax(amount: number, rate: number): number {
  return Math.round(amount * rate * 100) / 100;
}

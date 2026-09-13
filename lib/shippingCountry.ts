import type { Country } from '@/services/countryService';

/** Matches backend ShippingCountryRules for US domestic $7 vs international $10. */
export function isUnitedStatesCountry(country: string | null | undefined): boolean {
  if (!country?.trim()) return false;
  const trimmed = country.trim();
  if (trimmed.length === 2 && trimmed.toUpperCase() === 'US') return true;
  if (/^us$/i.test(trimmed)) return true;
  const collapsed = trimmed.replace(/\./g, '').replace(/\s+/g, ' ').toLowerCase();
  if (collapsed === 'usa' || collapsed === 'u s a') return true;
  return collapsed.includes('united states');
}

/** Map stored address / legacy text to ISO code for dropdowns. */
export function coerceCountryCode(value: string | undefined, countries: Country[]): string {
  if (!countries.length) return value?.trim().toUpperCase() || 'US';
  const v = (value || '').trim();
  if (!v) return 'US';
  if (v.length === 2) {
    const upper = v.toUpperCase();
    return countries.some((c) => c.code === upper) ? upper : 'US';
  }
  if (isUnitedStatesCountry(v)) return 'US';
  const byName = countries.find((c) => c.name.toLowerCase() === v.toLowerCase());
  if (byName) return byName.code;
  return 'US';
}

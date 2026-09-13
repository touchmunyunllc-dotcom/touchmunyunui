const US_ZIP = /^\d{5}(-\d{4})?$/;
const CA_POSTAL = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\d[ABCEGHJ-NPRSTV-Z]\d$/i;
const IN_PIN = /^\d{6}$/;
const UK_POST = /^(GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})$/i;
const AU_POST = /^\d{4}$/;
const GENERIC_CHARS = /^[A-Za-z0-9][A-Za-z0-9 -]*[A-Za-z0-9]$|^[A-Za-z0-9]{2,3}$/;
const HAS_DIGIT = /\d/;

export function postalCodePlaceholder(countryCode: string): string {
  switch ((countryCode || '').trim().toUpperCase()) {
    case 'US':
      return '10001';
    case 'CA':
      return 'K1A 0B1';
    case 'IN':
      return '110001';
    case 'GB':
      return 'SW1A 1AA';
    case 'AU':
      return '2000';
    default:
      return 'Postal / ZIP code';
  }
}

/** Returns an error message, or null if valid. */
export function validatePostalCode(postalCode: string, countryCode: string): string | null {
  const trimmed = postalCode.trim();
  if (!trimmed) {
    return 'Postal code is required';
  }
  if (trimmed.length > 20) {
    return 'Postal code must not exceed 20 characters';
  }

  const country = (countryCode || '').trim().toUpperCase();

  switch (country) {
    case 'US':
      return US_ZIP.test(trimmed) ? null : 'Enter a valid US ZIP code (e.g. 10001 or 10001-1234).';
    case 'CA': {
      const normalized = trimmed.toUpperCase().replace(/\s/g, '');
      return CA_POSTAL.test(normalized)
        ? null
        : 'Enter a valid Canadian postal code (e.g. K1A 0B1).';
    }
    case 'IN':
      return IN_PIN.test(trimmed) ? null : 'Enter a valid 6-digit PIN code.';
    case 'GB':
      return UK_POST.test(trimmed.toUpperCase())
        ? null
        : 'Enter a valid UK postcode (e.g. SW1A 1AA).';
    case 'AU':
      return AU_POST.test(trimmed) ? null : 'Enter a valid 4-digit Australian postcode.';
    default:
      if (trimmed.length < 3 || trimmed.length > 16) {
        return 'Enter a valid postal or ZIP code (3–16 characters).';
      }
      if (!GENERIC_CHARS.test(trimmed)) {
        return 'Postal code may only contain letters, numbers, spaces, and hyphens.';
      }
      if (!HAS_DIGIT.test(trimmed)) {
        return 'Enter a valid postal or ZIP code for the selected country.';
      }
      return null;
  }
}

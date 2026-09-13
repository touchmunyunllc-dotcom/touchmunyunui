import {
  parsePhoneNumberFromString,
  type CountryCode,
  type NumberType,
} from 'libphonenumber-js/max';

const MOBILE_LIKE: NumberType[] = ['MOBILE', 'FIXED_LINE_OR_MOBILE', 'PERSONAL_NUMBER'];

function toCountryCode(iso: string): CountryCode | undefined {
  const c = (iso || '').trim().toUpperCase();
  if (c.length !== 2) return undefined;
  return c as CountryCode;
}

export function phonePlaceholder(countryCode: string): string {
  switch ((countryCode || '').trim().toUpperCase()) {
    case 'US':
      return '(504) 248-6331';
    case 'CA':
      return '(416) 555-0123';
    case 'IN':
      return '98765 43210';
    case 'GB':
      return '07123 456789';
    case 'AU':
      return '0412 345 678';
    default:
      return '+1 504 248 6331';
  }
}

function parseMobile(trimmed: string, countryCode: string) {
  const country = toCountryCode(countryCode);
  if (trimmed.startsWith('+')) {
    return parsePhoneNumberFromString(trimmed);
  }
  if (!country) {
    return undefined;
  }
  return parsePhoneNumberFromString(trimmed, country);
}

/** Returns E.164 (e.g. +15042486331) or null if invalid. */
export function normalizePhoneNumber(phone: string, countryCode: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return null;
  const parsed = parseMobile(trimmed, countryCode);
  if (!parsed?.isValid()) return null;
  const type = parsed.getType();
  if (type && !MOBILE_LIKE.includes(type)) return null;
  const country = toCountryCode(countryCode);
  if (country && parsed.country && parsed.country !== country) return null;
  return parsed.format('E.164');
}

/** Returns an error message, or null if valid. */
export function validatePhoneNumber(
  phone: string,
  countryCode: string,
  required = true
): string | null {
  const trimmed = phone.trim();
  if (!trimmed) {
    return required ? 'Mobile number is required' : null;
  }
  if (trimmed.length > 30) {
    return 'Phone number must not exceed 30 characters';
  }

  if (!trimmed.startsWith('+') && !toCountryCode(countryCode)) {
    return 'Select a country or enter your number starting with + and country code.';
  }

  const parsed = parseMobile(trimmed, countryCode);
  if (!parsed) {
    return 'Enter a valid mobile number for the selected country.';
  }
  if (!parsed.isValid()) {
    return 'Enter a valid mobile number for the selected country.';
  }

  const type = parsed.getType();
  if (type && !MOBILE_LIKE.includes(type)) {
    return 'Enter a mobile number (not a landline or special service number).';
  }

  const country = toCountryCode(countryCode);
  if (country && parsed.country && parsed.country !== country) {
    return 'This mobile number does not match the selected country.';
  }

  return null;
}

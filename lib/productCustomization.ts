import { PRODUCT_COLOR_OPTIONS } from '@/components/ColorMultiSelect';

export const CUSTOMIZATION_TYPE_WRISTBAND = 'wristband';
export const WRISTBAND_NUMBER_MAX_LENGTH = 2;

/** Suggested copy for Admin → Variants when wristband customization is enabled (saved to DB on product save). */
export const WRISTBAND_SUGGESTED_POLICY =
  'Black and white wristbands are $25 with about 7–10 days production before shipping. '
  + 'Color wristbands are an additional $5 ($30 total) with about 10–12 days production before shipping. '
  + 'Shipping cost applies to all wristbands and is calculated at checkout.';

export const IMAGE_OBJECT_POSITION_PRESETS: { value: string; label: string }[] = [
  { value: '', label: 'Default (centered)' },
  { value: 'center', label: 'Center' },
  { value: 'center 88%', label: 'Lower — show bottom text (towels)' },
  { value: 'center 35%', label: 'Higher — show top area (joggers)' },
];

export type ProductVariantConfigState = {
  colors: string[];
  sizes: string[];
  colorImages: Record<string, string>;
  customizationType: string;
  colorSurcharge: string;
  noSurchargeColors: string[];
  customizationPolicy: string;
  imageObjectPosition: string;
};

export type ProductVariantApiPayload = {
  colors?: string[];
  sizes?: string[];
  colorImages?: Record<string, string>;
  customizationType?: string | null;
  colorSurcharge?: number;
  noSurchargeColors?: string[];
  customizationPolicy?: string | null;
  imageObjectPosition?: string | null;
};

export function isWristbandCustomizationType(type?: string | null): boolean {
  return (type || '').toLowerCase() === CUSTOMIZATION_TYPE_WRISTBAND;
}

export function applyWristbandDefaults(state: ProductVariantConfigState): ProductVariantConfigState {
  return {
    ...state,
    customizationType: CUSTOMIZATION_TYPE_WRISTBAND,
    customizationPolicy: state.customizationPolicy.trim() || WRISTBAND_SUGGESTED_POLICY,
  };
}

export function validateProductVariantConfig(state: ProductVariantConfigState): string | null {
  if (isWristbandCustomizationType(state.customizationType) && state.colors.length === 0) {
    return 'Wristband products need at least one band color';
  }
  const surcharge = state.colorSurcharge ? parseFloat(state.colorSurcharge) : 0;
  if (surcharge > 0 && state.colors.length === 0) {
    return 'Add at least one color when using a color surcharge';
  }
  if (surcharge < 0 || Number.isNaN(surcharge)) {
    return 'Color surcharge must be a valid amount';
  }
  return null;
}

function parseColorSurcharge(value: string): number {
  if (!value.trim()) return 0;
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

export function toProductVariantApiPayload(
  state: ProductVariantConfigState,
  mode: 'create' | 'update'
): ProductVariantApiPayload {
  const emptyCustomizationType = mode === 'update' ? '' : undefined;
  const payload: ProductVariantApiPayload = {
    colors: state.colors.length > 0 ? state.colors : mode === 'update' ? [] : undefined,
    sizes: state.sizes.length > 0 ? state.sizes : mode === 'update' ? [] : undefined,
    colorImages: state.colorImages,
    customizationType: state.customizationType || emptyCustomizationType,
    imageObjectPosition: state.imageObjectPosition.trim() || (mode === 'update' ? '' : undefined),
    colorSurcharge: parseColorSurcharge(state.colorSurcharge),
    noSurchargeColors: state.noSurchargeColors,
  };

  if (isWristbandCustomizationType(state.customizationType)) {
    payload.customizationPolicy = state.customizationPolicy.trim() || null;
  } else if (mode === 'update') {
    payload.customizationPolicy = '';
  } else {
    payload.customizationPolicy = undefined;
  }

  return payload;
}

export function resolveProductImageStyle(
  imageObjectPosition?: string | null
): { objectPosition?: string } {
  const pos = imageObjectPosition?.trim();
  return pos ? { objectPosition: pos } : {};
}

export function colorNameToHex(color?: string | null): string {
  if (!color) return '#F9FAFB';
  const match = PRODUCT_COLOR_OPTIONS.find((o) => o.name.toLowerCase() === color.trim().toLowerCase());
  if (match) return match.hex;
  return color;
}

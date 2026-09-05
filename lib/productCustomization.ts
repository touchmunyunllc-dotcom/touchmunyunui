import { PRODUCT_COLOR_OPTIONS } from '@/components/ColorMultiSelect';

export const CUSTOMIZATION_TYPE_WRISTBAND = 'wristband';
export const WRISTBAND_NUMBER_MAX_LENGTH = 2;

export const WRISTBAND_DEFAULTS = {
  colorSurcharge: '5',
  noSurchargeColors: ['Black', 'White'],
  customizationPolicy:
    'Black and white wristbands are $25 with about 7–10 days production before shipping. '
    + 'Color wristbands are an additional $5 ($30 total) with about 10–12 days production before shipping. '
    + 'Shipping cost applies to all wristbands and is calculated at checkout.',
};

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
    colorSurcharge: state.colorSurcharge || WRISTBAND_DEFAULTS.colorSurcharge,
    noSurchargeColors:
      state.noSurchargeColors.length > 0
        ? state.noSurchargeColors
        : [...WRISTBAND_DEFAULTS.noSurchargeColors],
    customizationPolicy: state.customizationPolicy.trim() || WRISTBAND_DEFAULTS.customizationPolicy,
  };
}

export function validateProductVariantConfig(state: ProductVariantConfigState): string | null {
  if (isWristbandCustomizationType(state.customizationType) && state.colors.length === 0) {
    return 'Wristband products need at least one band color';
  }
  return null;
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
  };

  if (isWristbandCustomizationType(state.customizationType)) {
    payload.colorSurcharge = state.colorSurcharge ? parseFloat(state.colorSurcharge) : 0;
    payload.noSurchargeColors = state.noSurchargeColors;
    payload.customizationPolicy = state.customizationPolicy.trim() || null;
  } else if (mode === 'update') {
    payload.colorSurcharge = 0;
    payload.noSurchargeColors = [];
    payload.customizationPolicy = '';
  } else {
    payload.colorSurcharge = undefined;
    payload.noSurchargeColors = undefined;
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

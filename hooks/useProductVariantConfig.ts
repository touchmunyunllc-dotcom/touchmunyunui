import { useCallback, useState } from 'react';
import { imageService } from '@/services/imageService';
import { notificationService } from '@/services/notificationService';
import {
  applyWristbandDefaults,
  ProductVariantConfigState,
  type ProductVariantApiPayload,
  toProductVariantApiPayload,
  validateProductVariantConfig,
} from '@/lib/productCustomization';

const EMPTY_STATE: ProductVariantConfigState = {
  colors: [],
  sizes: [],
  colorImages: {},
  customizationType: '',
  colorSurcharge: '',
  noSurchargeColors: [],
  customizationPolicy: '',
  imageObjectPosition: '',
};

export function useProductVariantConfig(initial?: Partial<ProductVariantConfigState>) {
  const [state, setState] = useState<ProductVariantConfigState>({
    ...EMPTY_STATE,
    ...initial,
  });
  const [sizeInput, setSizeInput] = useState('');
  const [uploadingColor, setUploadingColor] = useState<string | null>(null);

  const setColors = useCallback((colors: string[]) => {
    setState((prev) => {
      const pruned: Record<string, string> = {};
      for (const c of colors) {
        if (prev.colorImages[c]) pruned[c] = prev.colorImages[c];
      }
      return { ...prev, colors, colorImages: pruned };
    });
  }, []);

  const setCustomizationType = useCallback((customizationType: string) => {
    setState((prev) => {
      if (customizationType === 'wristband') {
        return applyWristbandDefaults({ ...prev, customizationType });
      }
      return {
        ...prev,
        customizationType,
        customizationPolicy: '',
      };
    });
  }, []);

  const addSize = useCallback((raw: string) => {
    const val = raw.trim();
    if (!val) return;
    setState((prev) => (prev.sizes.includes(val) ? prev : { ...prev, sizes: [...prev.sizes, val] }));
  }, []);

  const removeSize = useCallback((size: string) => {
    setState((prev) => ({ ...prev, sizes: prev.sizes.filter((s) => s !== size) }));
  }, []);

  const toggleNoSurchargeColor = useCallback((color: string, checked: boolean) => {
    setState((prev) => ({
      ...prev,
      noSurchargeColors: checked
        ? [...prev.noSurchargeColors, color]
        : prev.noSurchargeColors.filter((c) => c !== color),
    }));
  }, []);

  const handleColorImageUpload = useCallback(async (color: string, file: File) => {
    setUploadingColor(color);
    try {
      const url = await imageService.uploadImage(file);
      setState((prev) => ({ ...prev, colorImages: { ...prev.colorImages, [color]: url } }));
      notificationService.success(`${color} image uploaded`);
    } catch {
      notificationService.error(`Failed to upload ${color} image`);
    } finally {
      setUploadingColor(null);
    }
  }, []);

  const loadFromProduct = useCallback(
    (product: Partial<ProductVariantConfigState & { colorSurcharge?: number | string | null }>) => {
      setState({
        colors: product.colors || [],
        sizes: product.sizes || [],
        colorImages: product.colorImages || {},
        customizationType: product.customizationType || '',
        colorSurcharge: product.colorSurcharge != null ? String(product.colorSurcharge) : '',
        noSurchargeColors: product.noSurchargeColors || [],
        customizationPolicy: product.customizationPolicy || '',
        imageObjectPosition: product.imageObjectPosition || '',
      });
    },
    []
  );

  const validate = useCallback(() => validateProductVariantConfig(state), [state]);

  const toApiPayload = useCallback(
    (mode: 'create' | 'update'): ProductVariantApiPayload => toProductVariantApiPayload(state, mode),
    [state]
  );

  return {
    state,
    sizeInput,
    setSizeInput,
    uploadingColor,
    setColors,
    setSizes: (sizes: string[]) => setState((prev) => ({ ...prev, sizes })),
    setColorImages: (colorImages: Record<string, string>) => setState((prev) => ({ ...prev, colorImages })),
    setCustomizationType,
    setColorSurcharge: (colorSurcharge: string) => setState((prev) => ({ ...prev, colorSurcharge })),
    setCustomizationPolicy: (customizationPolicy: string) =>
      setState((prev) => ({ ...prev, customizationPolicy })),
    setImageObjectPosition: (imageObjectPosition: string) =>
      setState((prev) => ({ ...prev, imageObjectPosition })),
    addSize,
    removeSize,
    toggleNoSurchargeColor,
    handleColorImageUpload,
    loadFromProduct,
    validate,
    toApiPayload,
  };
}

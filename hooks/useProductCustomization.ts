import { useEffect, useMemo, useState } from 'react';
import { Product } from '@/services/productService';
import {
  buildCartItemPayload,
  getInitialWritingColor,
  getColorSurcharge,
  isWristbandProduct,
  matchesCartLine,
  resolveDisplayImage,
  resolveEffectiveSelection,
  resolveProductUnitPrice,
  validateWristbandSelection,
  type CustomizableLine,
} from '@/services/productCustomizationService';

type CartItemLike = CustomizableLine & { productId: string; quantity: number; id?: string };

export function useProductCustomization(product: Product | null, cartItems: CartItemLike[]) {
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [customNumber, setCustomNumber] = useState('');
  const [writingColor, setWritingColor] = useState('White');

  const isWristband = product ? isWristbandProduct(product) : false;

  const selection = useMemo<CustomizableLine>(
    () => ({
      selectedColor,
      selectedSize,
      customNumber,
      writingColor: isWristband ? writingColor : undefined,
    }),
    [selectedColor, selectedSize, customNumber, writingColor, isWristband]
  );

  const effectiveSelection = useMemo(
    () => (product ? resolveEffectiveSelection(product, selection) : selection),
    [product, selection]
  );

  useEffect(() => {
    if (!product) return;
    if (product.colors?.length) {
      setSelectedColor(product.colors[0]);
      if (isWristbandProduct(product)) {
        setWritingColor(getInitialWritingColor(product));
      }
    }
    if (product.sizes?.length) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  const matchingCartItem = useMemo(() => {
    if (!product) return undefined;
    return cartItems.find((item) => matchesCartLine(item, product.id, effectiveSelection));
  }, [product, cartItems, effectiveSelection]);

  const displayUnitPrice = product ? resolveProductUnitPrice(product, selectedColor) : 0;
  const colorSurchargeAmount = product ? getColorSurcharge(product, selectedColor) : 0;
  const displayImage = product ? resolveDisplayImage(product, selectedColor) : '/placeholder.png';

  const validateSelection = () =>
    product
      ? validateWristbandSelection(
          product,
          effectiveSelection.selectedColor ?? undefined,
          effectiveSelection.customNumber ?? undefined,
          effectiveSelection.writingColor ?? undefined
        )
      : null;

  const toCartPayload = (quantity: number) => {
    if (!product) throw new Error('Product not loaded');
    const image = resolveDisplayImage(product, effectiveSelection.selectedColor ?? undefined);
    return buildCartItemPayload(product, effectiveSelection, quantity, image);
  };

  return {
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    customNumber,
    setCustomNumber,
    writingColor,
    setWritingColor,
    isWristband,
    selection,
    effectiveSelection,
    matchingCartItem,
    displayUnitPrice,
    colorSurchargeAmount,
    displayImage,
    validateSelection,
    toCartPayload,
  };
}

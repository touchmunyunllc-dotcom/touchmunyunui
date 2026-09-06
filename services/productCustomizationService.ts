import { Product } from '@/services/productService';
import { colorNameToHex, resolveProductImageStyle, WRISTBAND_NUMBER_MAX_LENGTH } from '@/lib/productCustomization';

export interface PricedProduct {
  price: number;
  salePrice?: number;
  customizationType?: string | null;
  colorSurcharge?: number;
  noSurchargeColors?: string[];
}

export interface CustomizableLine {
  selectedColor?: string | null;
  selectedSize?: string | null;
  customNumber?: string | null;
  writingColor?: string | null;
}

export interface CustomizableCartItem extends CustomizableLine {
  productId: string;
  id?: string;
  customizationPolicy?: string | null;
}

export function isWristbandProduct(product: PricedProduct): boolean {
  return (product.customizationType || '').toLowerCase() === 'wristband';
}

export function isNoSurchargeColor(product: PricedProduct, color?: string | null): boolean {
  if (!color || !product.noSurchargeColors?.length) return false;
  const c = color.trim().toLowerCase();
  return product.noSurchargeColors.some((n) => n.toLowerCase() === c);
}

export function getColorSurcharge(product: PricedProduct, selectedColor?: string | null): number {
  if (!product.colorSurcharge || product.colorSurcharge <= 0 || !selectedColor) {
    return 0;
  }
  return isNoSurchargeColor(product, selectedColor) ? 0 : product.colorSurcharge;
}

export function resolveProductUnitPrice(product: PricedProduct, selectedColor?: string | null): number {
  const base = product.salePrice ?? product.price;
  return base + getColorSurcharge(product, selectedColor);
}

export function collectCustomizationPolicies(
  items: Array<CustomizableLine & { customizationPolicy?: string | null }>
): string[] {
  return [
    ...new Set(
      items
        .map((i) => i.customizationPolicy?.trim())
        .filter((p): p is string => Boolean(p))
    ),
  ];
}

export function validateWristbandSelection(
  product: Product,
  selectedColor?: string,
  customNumber?: string,
  writingColor?: string
): string | null {
  if (!isWristbandProduct(product)) return null;
  if (!selectedColor) return 'Please select a band color';
  if (!new RegExp(`^\\d{1,${WRISTBAND_NUMBER_MAX_LENGTH}}$`).test((customNumber || '').trim()))
    return `Enter a number (digits only, max ${WRISTBAND_NUMBER_MAX_LENGTH})`;
  if (!writingColor) return 'Please select a writing color';
  return null;
}

export function resolveDisplayImage(product: Product, selectedColor?: string): string {
  if (selectedColor && product.colorImages?.[selectedColor]) {
    return product.colorImages[selectedColor];
  }
  if (selectedColor && product.colorImages) {
    const key = Object.keys(product.colorImages).find(
      (k) => k.toLowerCase() === selectedColor.toLowerCase()
    );
    if (key) return product.colorImages[key];
  }
  return product.imageUrl || '/placeholder.png';
}

/** All unique product images for gallery / tile slideshow (main, images[], color variants). */
export function getProductGalleryImages(
  product: Pick<Product, 'imageUrl' | 'images' | 'colorImages'>
): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];

  const add = (url?: string | null) => {
    const trimmed = url?.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    urls.push(trimmed);
  };

  (product.images ?? []).forEach(add);
  add(product.imageUrl);
  if (product.colorImages) {
    Object.values(product.colorImages).forEach(add);
  }

  return urls.length > 0 ? urls : ['/placeholder.png'];
}

function normCartField(value?: string | null): string {
  return (value ?? '').trim().toLowerCase();
}

/** Empty/missing options match a filled value so listing adds merge with PDP adds. */
function fieldCompatible(a?: string | null, b?: string | null): boolean {
  const left = normCartField(a);
  const right = normCartField(b);
  return !left || !right || left === right;
}

/** Same product line: missing color/size is treated as the same as a later filled default. */
export function sameCartVariant(a: CustomizableLine, b: CustomizableLine): boolean {
  return (
    fieldCompatible(a.selectedColor, b.selectedColor) &&
    fieldCompatible(a.selectedSize, b.selectedSize) &&
    fieldCompatible(a.customNumber, b.customNumber) &&
    fieldCompatible(a.writingColor, b.writingColor)
  );
}

export function isSameGuestProductLine(
  a: CustomizableLine & { productId: string },
  b: CustomizableLine & { productId: string }
): boolean {
  return a.productId === b.productId && sameCartVariant(a, b);
}

/** Stable guest cart line id — avoids duplicate rows from Date.now() / Strict Mode. */
export function buildGuestCartLineId(line: CustomizableLine & { productId: string }): string {
  return [
    line.productId,
    normCartField(line.selectedColor),
    normCartField(line.selectedSize),
    normCartField(line.customNumber),
    normCartField(line.writingColor),
  ].join('::');
}

export type GuestCartMergeMode = 'add' | 'set';

type GuestCartLineInput = CustomizableLine & {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
  customizationPolicy?: string;
};

type GuestCartLine = GuestCartLineInput & { id: string };

export function mergeGuestCartLine(
  prevItems: GuestCartLine[],
  item: GuestCartLineInput,
  mode: GuestCartMergeMode,
  maxQuantity = 10
): GuestCartLine[] {
  const lineId = buildGuestCartLineId(item);
  const matches = prevItems.filter((i) => isSameGuestProductLine(i, item));
  const rest = prevItems.filter((i) => !isSameGuestProductLine(i, item));

  if (matches.length > 0) {
    const base = matches[0];
    const combinedQty = matches.reduce((sum, line) => sum + line.quantity, 0);
    const nextQty =
      mode === 'set'
        ? Math.min(maxQuantity, item.quantity)
        : Math.min(maxQuantity, combinedQty + item.quantity);
    return [...rest, { ...base, ...item, id: lineId, quantity: nextQty }];
  }

  if (prevItems.some((i) => i.id === lineId)) {
    return prevItems;
  }

  return [...prevItems, { ...item, id: lineId, quantity: Math.min(maxQuantity, item.quantity) }];
}

export function dedupeGuestCartLines(items: GuestCartLine[], maxQuantity = 10): GuestCartLine[] {
  const merged: GuestCartLine[] = [];
  for (const item of items) {
    const normalized: GuestCartLine = {
      ...item,
      id: buildGuestCartLineId(item),
    };
    const existingIndex = merged.findIndex((i) => isSameGuestProductLine(i, normalized));
    if (existingIndex >= 0) {
      const existing = merged[existingIndex];
      merged[existingIndex] = {
        ...existing,
        ...normalized,
        id: buildGuestCartLineId(normalized),
        // Keep the higher qty when collapsing duplicate rows (not sum — avoids 1+1=2 from bugs).
        quantity: Math.min(maxQuantity, Math.max(existing.quantity, normalized.quantity)),
      };
    } else {
      merged.push(normalized);
    }
  }
  return merged;
}

export function matchesCartLine(
  item: CustomizableCartItem,
  productId: string,
  line: CustomizableLine,
  _isWristband?: boolean
): boolean {
  return item.productId === productId && sameCartVariant(item, line);
}

export function resolveEffectiveSelection(
  product: Product,
  line: CustomizableLine
): CustomizableLine {
  const isWristband = isWristbandProduct(product);
  return {
    selectedColor: line.selectedColor ?? product.colors?.[0] ?? undefined,
    selectedSize: line.selectedSize ?? product.sizes?.[0] ?? undefined,
    customNumber: line.customNumber ?? '',
    writingColor: isWristband
      ? line.writingColor ?? getInitialWritingColor(product)
      : undefined,
  };
}

export function getCartLineOptions(line: CustomizableLine & { cartLineId?: string }) {
  return {
    selectedColor: line.selectedColor ?? undefined,
    selectedSize: line.selectedSize ?? undefined,
    customNumber: line.customNumber ?? undefined,
    writingColor: line.writingColor ?? undefined,
    cartLineId: line.cartLineId,
  };
}

export function toDefaultCartPayload(product: Product, quantity = 1) {
  const selection = resolveEffectiveSelection(product, {});
  return buildCartItemPayload(
    product,
    selection,
    quantity,
    resolveDisplayImage(product, selection.selectedColor ?? undefined)
  );
}

export function buildCartItemPayload(
  product: Product,
  line: CustomizableLine,
  quantity: number,
  image: string
) {
  const isWristband = isWristbandProduct(product);
  return {
    productId: product.id,
    name: product.name,
    price: resolveProductUnitPrice(product, line.selectedColor ?? undefined),
    quantity,
    image,
    selectedColor: line.selectedColor ?? undefined,
    selectedSize: line.selectedSize ?? undefined,
    customNumber: isWristband ? line.customNumber?.trim() || undefined : undefined,
    writingColor: isWristband ? line.writingColor ?? undefined : undefined,
    customizationPolicy: isWristband ? product.customizationPolicy ?? undefined : undefined,
  };
}

export function getInitialWritingColor(product: Product): string {
  if (!product.colors?.length) return 'White';
  return product.colors.find((c) => c.toLowerCase() === 'white') ?? product.colors[0];
}

export { colorNameToHex, resolveProductImageStyle };

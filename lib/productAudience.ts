import { Product } from '@/services/productService';

export type ProductAudience = 'women' | 'men' | 'unisex';

const WOMEN_HINTS = ['crop top', 'crop', 'sleeveless'];
const UNISEX_HINTS = [
  'wristband',
  'wrist',
  'headband',
  'arm band',
  'armband',
  'towel',
  'accessory',
  'accessories',
  'sock',
];

/** Client rule: crop tops = women's; accessories = unisex; other apparel = men's. */
export function resolveProductAudience(
  product: Pick<Product, 'name' | 'category'>
): ProductAudience {
  const blob = `${product.name} ${product.category}`.toLowerCase();
  if (WOMEN_HINTS.some((hint) => blob.includes(hint))) {
    return 'women';
  }
  if (UNISEX_HINTS.some((hint) => blob.includes(hint))) {
    return 'unisex';
  }
  return 'men';
}

export function audienceLabel(audience: ProductAudience): string {
  switch (audience) {
    case 'women':
      return "Women's";
    case 'men':
      return "Men's";
    default:
      return 'Unisex';
  }
}

export function audienceBadgeClass(audience: ProductAudience): string {
  switch (audience) {
    case 'women':
      return 'bg-pink-500/15 text-pink-300 border-pink-500/30';
    case 'men':
      return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    default:
      return 'bg-white/10 text-white/80 border-white/15';
  }
}

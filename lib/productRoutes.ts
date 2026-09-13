const GUID_SEGMENT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isProductGuidSegment(segment: string): boolean {
  return GUID_SEGMENT.test(segment.trim());
}

export function productHref(product: { id: string; slug?: string | null }): string {
  const slug = product.slug?.trim();
  if (slug) {
    return `/products/${slug}`;
  }
  return `/products/${product.id}`;
}

export const productsListHref = '/products';

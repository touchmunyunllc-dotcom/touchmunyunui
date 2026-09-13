/** Internal/import copy — not meant for shoppers (e.g. Shopify image-listing imports). */
export function isImportPlaceholderDescription(description?: string | null): boolean {
  const text = description?.trim();
  if (!text) return false;

  if (/^imported from image listing\b/i.test(text)) return true;
  if (/^imported from\b/i.test(text) && /\bvendor\s*:/i.test(text)) return true;
  if (/^auto-created placeholder\b/i.test(text)) return true;

  return false;
}

/** Customer-facing description, or null when empty / placeholder. */
export function displayProductDescription(description?: string | null): string | null {
  const text = description?.trim();
  if (!text || isImportPlaceholderDescription(text)) return null;
  return text;
}

export function productDescriptionForSeo(product: {
  name: string;
  category?: string;
  description?: string | null;
}): string {
  const visible = displayProductDescription(product.description);
  if (visible) return visible;
  const category = product.category?.trim();
  return category
    ? `Shop ${product.name} — ${category} at Touch Munyun.`
    : `Shop ${product.name} at Touch Munyun. Performance accessories and apparel.`;
}

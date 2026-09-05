/** Normalize gallery URLs from API (images[] + legacy imageUrl). */
export function normalizeProductGalleryImages(product: {
  imageUrl?: string;
  images?: string[];
}): string[] {
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

  return urls;
}

export function primaryProductImage(images: string[]): string {
  return images[0] ?? '';
}

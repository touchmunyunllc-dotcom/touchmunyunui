/** Next.js `sizes` hints for `<Image fill />` — helps the browser pick the right src width. */
export const IMAGE_SIZES = {
  productDetail: '(max-width: 1024px) 100vw, 50vw',
  productCard: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  productCardCompact: '(max-width: 640px) 45vw, 220px',
  productListThumb: '112px',
  cartThumb: '80px',
  cartDrawerThumb: '80px',
  orderThumbSm: '48px',
  orderThumb: '64px',
  orderThumbLg: '80px',
  hero: '100vw',
} as const;

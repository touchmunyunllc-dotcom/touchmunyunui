/** Next.js `sizes` hints for `<Image fill />` — helps the browser pick the right src width. */
export const IMAGE_SIZES = {
  productDetail: '(max-width: 1024px) 100vw, 50vw',
  cartThumb: '80px',
  orderThumbSm: '48px',
  orderThumb: '64px',
  orderThumbLg: '80px',
  hero: '100vw',
} as const;

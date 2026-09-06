import { useEffect, useMemo, useState } from 'react';
import { Product } from '@/services/productService';
import {
  getProductGalleryImages,
  resolveProductImageStyle,
} from '@/services/productCustomizationService';
import { ProductImage } from '@/components/ProductImage';
import { IMAGE_SIZES } from '@/lib/imageSizes';

interface ProductCardGalleryProps {
  product: Pick<Product, 'id' | 'name' | 'imageUrl' | 'images' | 'colorImages' | 'imageObjectPosition'>;
  compact?: boolean;
  variant?: 'grid' | 'list' | 'detail';
  showDots?: boolean;
  activeImageUrl?: string;
}

export const ProductCardGallery: React.FC<ProductCardGalleryProps> = ({
  product,
  compact = false,
  variant = 'grid',
  showDots = true,
  activeImageUrl,
}) => {
  const images = useMemo(() => getProductGalleryImages(product), [product]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const imageStyle = resolveProductImageStyle(product.imageObjectPosition);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    setIndex(0);
  }, [product.id]);

  useEffect(() => {
    if (!activeImageUrl) return;
    const matchIndex = images.findIndex((src) => src === activeImageUrl);
    if (matchIndex >= 0) setIndex(matchIndex);
  }, [activeImageUrl, images]);

  useEffect(() => {
    if (!hasMultiple || paused) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [hasMultiple, images.length, paused, product.id]);

  const goTo = (nextIndex: number, event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    setIndex((nextIndex + images.length) % images.length);
    setPaused(true);
  };

  const heightClass =
    variant === 'detail'
      ? 'aspect-square max-h-[520px]'
      : variant === 'list'
        ? 'h-28'
        : compact
          ? 'aspect-square w-full'
          : 'aspect-[4/5] w-full';

  const imageFitClass = variant === 'detail' ? 'object-contain p-4' : 'object-cover';
  const imageSizes =
    variant === 'detail'
      ? IMAGE_SIZES.productDetail
      : variant === 'list'
        ? IMAGE_SIZES.productListThumb
        : compact
          ? IMAGE_SIZES.productCardCompact
          : IMAGE_SIZES.productCard;

  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 ${
        variant === 'detail' ? 'rounded-2xl border border-white/10' : ''
      } ${heightClass}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((src, imageIndex) => (
        <ProductImage
          key={`${src}-${imageIndex}`}
          src={src}
          alt={hasMultiple ? `${product.name} — view ${imageIndex + 1}` : product.name}
          style={imageStyle}
          sizes={imageSizes}
          priority={imageIndex === 0 && variant === 'detail'}
          className={`absolute inset-0 w-full h-full ${imageFitClass} transition-opacity duration-700 ${
            imageIndex === index ? 'opacity-100' : 'opacity-0'
          } ${variant === 'detail' ? '' : 'transition-transform duration-500'}`}
        />
      ))}

      {hasMultiple && (
        <span className="absolute top-2 right-2 z-10 rounded-full bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white pointer-events-none">
          {index + 1}/{images.length}
        </span>
      )}

      {hasMultiple && (variant === 'grid' || variant === 'detail') && (
        <>
          <button
            type="button"
            onClick={(e) => goTo(index - 1, e)}
            aria-label="Previous image"
            className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/55 p-2 sm:p-1 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-black/75 touch-manipulation"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => goTo(index + 1, e)}
            aria-label="Next image"
            className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/55 p-2 sm:p-1 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-black/75 touch-manipulation"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />

      {hasMultiple && showDots && (
        <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1">
          {images.map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              aria-label={`Show image ${dotIndex + 1}`}
              onClick={(e) => goTo(dotIndex, e)}
              className={`rounded-full transition-all touch-manipulation p-1 -m-1 ${
                dotIndex === index
                  ? compact
                    ? 'h-1 w-3 bg-white'
                    : 'h-1.5 w-3.5 bg-white'
                  : compact
                    ? 'h-1 w-1 bg-white/40 hover:bg-white/70'
                    : 'h-1.5 w-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

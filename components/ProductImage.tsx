import Image from 'next/image';
import { IMAGE_SIZES } from '@/lib/imageSizes';

const FALLBACK_SRC = '/icons/icon-192x192.png';

function normalizeImageSrc(src?: string | null): string {
  const trimmed = src?.trim();
  if (!trimmed) return FALLBACK_SRC;
  if (trimmed.startsWith('http') || trimmed.startsWith('/')) return trimmed;
  return `/${trimmed}`;
}

type ProductImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
};

export function ProductImage({
  src,
  alt,
  className = '',
  style,
  sizes,
  priority = false,
  fill = true,
  width,
  height,
}: ProductImageProps) {
  const normalizedSrc = normalizeImageSrc(src);

  if (fill) {
    return (
      <Image
        src={normalizedSrc}
        alt={alt}
        fill
        sizes={sizes ?? IMAGE_SIZES.productCard}
        className={className}
        style={style}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={normalizedSrc}
      alt={alt}
      width={width ?? 80}
      height={height ?? 80}
      sizes={sizes ?? IMAGE_SIZES.cartThumb}
      className={className}
      style={style}
      priority={priority}
    />
  );
}

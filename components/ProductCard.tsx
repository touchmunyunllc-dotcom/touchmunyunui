import React from 'react';
import Link from 'next/link';
import { Product } from '@/services/productService';
import { ProductCardGallery } from '@/components/ProductCardGallery';
import { ProductPurchaseActions } from '@/components/ProductPurchaseActions';
import { ProductAudienceBadge } from '@/components/ProductAudienceBadge';
import { productHref } from '@/lib/productRoutes';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  href?: string;
  /** Set false on admin pages — storefront tiles always show purchase actions. */
  showPurchaseActions?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  compact = false,
  href,
  showPurchaseActions = true,
}) => {
  const linkHref = href ?? productHref(product.id);

  return (
    <div
      className={`group relative flex h-full w-full min-w-0 flex-col bg-primary/60 backdrop-blur-md shadow-glass hover:shadow-lg transition-all duration-300 overflow-hidden border border-foreground/20 hover:border-red-500/40 ${
        compact ? 'rounded-xl' : 'rounded-2xl'
      }`}
    >
      <Link href={linkHref} className="block shrink-0 w-full min-w-0">
        <ProductCardGallery product={product} compact={compact} />
      </Link>

      <div className={`relative z-10 flex flex-1 flex-col min-w-0 ${compact ? 'p-3.5 pt-2.5' : 'p-5'}`}>
        <Link href={linkHref} className="block min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span
              className={`inline-block font-semibold text-foreground/90 bg-white/10 border border-white/15 rounded-full ${
                compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs'
              }`}
            >
              {product.category}
            </span>
            <ProductAudienceBadge product={product} compact={compact} />
          </div>

          <h3
            className={`font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors ${
              compact ? 'text-[15px]' : 'text-lg'
            }`}
          >
            {product.name}
          </h3>

          {!compact && (
            <p className="text-foreground/60 text-sm mt-1 mb-2 line-clamp-2 min-h-[2.5rem]">
              {product.description}
            </p>
          )}
        </Link>

        <div className={`mt-auto min-w-0 ${compact ? 'mt-2' : 'mt-1'}`}>
          <div className="min-w-0">
            {product.salePrice ? (
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className={`font-bold text-red-500 ${compact ? 'text-lg' : 'text-2xl'}`}>
                  ${product.salePrice.toFixed(2)}
                </span>
                <span className={`text-foreground/50 line-through ${compact ? 'text-[10px]' : 'text-sm'}`}>
                  ${product.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className={`font-bold text-red-500 ${compact ? 'text-lg' : 'text-2xl'}`}>
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {showPurchaseActions && <ProductPurchaseActions product={product} compact={compact} />}
        </div>
      </div>
    </div>
  );
};

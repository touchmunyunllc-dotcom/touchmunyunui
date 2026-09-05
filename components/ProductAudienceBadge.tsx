import { Product } from '@/services/productService';
import {
  audienceBadgeClass,
  audienceLabel,
  resolveProductAudience,
} from '@/lib/productAudience';

type ProductAudienceBadgeProps = {
  product: Pick<Product, 'name' | 'category'>;
  compact?: boolean;
};

export function ProductAudienceBadge({ product, compact = false }: ProductAudienceBadgeProps) {
  const audience = resolveProductAudience(product);
  return (
    <span
      className={`inline-block font-medium border rounded-full ${audienceBadgeClass(audience)} ${
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'
      }`}
    >
      {audienceLabel(audience)}
    </span>
  );
}

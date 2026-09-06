import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/skeletons/ProductCardSkeleton';
import { productService, Product } from '@/services/productService';

type RelatedProductsProps = {
  productId: string;
  category?: string;
  limit?: number;
};

export function RelatedProducts({ productId, category, limit = 4 }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const result = await productService.getAll(category ? { category } : undefined);
        const rows = Array.isArray(result) ? result : result.products;
        const related = rows.filter((p) => p.id !== productId).slice(0, limit);
        if (!cancelled) setProducts(related);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [productId, category, limit]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="mt-12 pt-10 border-t border-white/10">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
        You may also <span className="text-red-500">like</span>
      </h2>
      {loading ? (
        <ProductGridSkeleton count={limit} compact />
      ) : (
        <div className="grid grid-auto-fill-catalog gap-4 items-stretch [&>*]:min-w-0">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </div>
      )}
    </section>
  );
}

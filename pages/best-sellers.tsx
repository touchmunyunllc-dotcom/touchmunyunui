import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { SEO } from '@/components/SEO';
import { StructuredData } from '@/components/StructuredData';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { productService, Product } from '@/services/productService';
import { notificationService } from '@/services/notificationService';

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getBestSellers();
        setProducts(data);
      } catch (error) {
        notificationService.error('Failed to load best sellers');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <SEO
        title="Best Sellers - Touch Munyun | Top Picks"
        description="Shop Touch Munyun's best-selling performance accessories and apparel. The most popular wristbands, headbands, hoodies, and shirts chosen by athletes and grinders."
        keywords="best sellers, top sellers, popular sportswear, Touch Munyun best, trending accessories, popular apparel"
      />
      <StructuredData
        type="BreadcrumbList"
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_SITE_URL || 'https://touchmunyun.com' },
            { '@type': 'ListItem', position: 2, name: 'Best Sellers', item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://touchmunyun.com'}/best-sellers` },
          ],
        }}
      />
      <Layout>
        <section className="bg-primary pb-8 overflow-x-hidden">
          <div className="page-shell pt-4">
            <div className="mb-4 border-b border-foreground/10 pb-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Best <span className="text-red-500">Sellers</span>
              </h1>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-foreground/70">No best sellers available.</p>
              </div>
            ) : (
              <div className="grid grid-auto-fill-lg gap-6 sm:gap-8 items-stretch [&>*]:min-w-0">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </Layout>
    </>
  );
}

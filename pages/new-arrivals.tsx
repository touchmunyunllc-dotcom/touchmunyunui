import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { SEO } from '@/components/SEO';
import { StructuredData } from '@/components/StructuredData';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { productService, Product } from '@/services/productService';
import { notificationService } from '@/services/notificationService';

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getNewArrivals();
        setProducts(data);
      } catch (error) {
        notificationService.error('Failed to load new arrivals');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <SEO
        title="New Arrivals - Touch Munyun | Latest Drops"
        description="Check out the latest drops from Touch Munyun. New performance accessories and apparel for athletes and grinders — fresh wristbands, headbands, hoodies, shirts, and more."
        keywords="new arrivals, latest drops, Touch Munyun new, new sportswear, new accessories, new apparel"
      />
      <StructuredData
        type="BreadcrumbList"
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_SITE_URL || 'https://touchmunyun.com' },
            { '@type': 'ListItem', position: 2, name: 'New Arrivals', item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://touchmunyun.com'}/new-arrivals` },
          ],
        }}
      />
      <Layout>
        <section className="bg-primary pb-8 overflow-x-hidden">
          <div className="page-shell pt-4">
            <div className="mb-4 border-b border-foreground/10 pb-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                New <span className="text-red-500">Arrivals</span>
              </h1>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-foreground/70">No new arrivals at the moment.</p>
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

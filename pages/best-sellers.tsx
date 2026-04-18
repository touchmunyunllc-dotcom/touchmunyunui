import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { SEO } from '@/components/SEO';
import { StructuredData } from '@/components/StructuredData';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { productService, Product } from '@/services/productService';
import { useCart } from '@/context/CartContext';
import { notificationService } from '@/services/notificationService';

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

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

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.imageUrl,
      });
      notificationService.success(`${product.name} added to cart!`);
    } catch (error) {
      // Error already handled in CartContext
    }
  };

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
      <div className="bg-primary py-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-30" style={{
          background: 'radial-gradient(ellipse at center, rgba(220, 38, 38, 0.1) 0%, transparent 70%)'
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Best Sellers
          </h1>
          <p className="text-xl text-foreground/80">
            Our most loved handcrafted pieces
          </p>
        </div>
      </div>

      <section className="py-12 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-foreground/70">No best sellers available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
    </>
  );
}


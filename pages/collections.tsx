import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { SEO } from '@/components/SEO';
import { StructuredData } from '@/components/StructuredData';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { productService, Product } from '@/services/productService';
import { notificationService } from '@/services/notificationService';

export default function Collections() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<string>('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch all products to get categories, but filter by category when one is selected
        const filters = selectedCollection !== 'all' 
          ? { category: selectedCollection }
          : undefined;
        const result = await productService.getAll(filters);
        const data = Array.isArray(result) ? result : result.products;
        setProducts(data);
      } catch (error) {
        console.error('Failed to load collections:', error);
        notificationService.error('Failed to load collections');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCollection]);

  // Get unique categories as collections - fetch all products once to get categories
  const [allCategories, setAllCategories] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await productService.getAll();
        const allProducts = Array.isArray(result) ? result : result.products;
        const categories = Array.from(new Set(allProducts.map((p: Product) => p.category).filter(Boolean))) as string[];
        setAllCategories(['all', ...categories]);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const collections = allCategories.length > 0 ? allCategories : ['all'];
  const filteredProducts = products;

  return (
    <>
      <SEO
        title="Collections - Touch Munyun | Shop by Category"
        description="Browse Touch Munyun collections — performance accessories and apparel organized by category. Find wristbands, headbands, hoodies, shirts, and more for athletes and grinders."
        keywords="Touch Munyun collections, sports categories, athletic accessories, performance apparel, wristbands, headbands, hoodies"
      />
      <StructuredData
        type="BreadcrumbList"
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_SITE_URL || 'https://touchmunyun.com' },
            { '@type': 'ListItem', position: 2, name: 'Collections', item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://touchmunyun.com'}/collections` },
          ],
        }}
      />
      <Layout>
        <section className="bg-primary pb-8 overflow-x-hidden">
          <div className="page-shell pt-4">
            <div className="mb-4 border-b border-foreground/10 pb-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                <span className="text-red-500">Collections</span>
              </h1>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
              {collections.map((collection) => (
                <button
                  key={collection}
                  onClick={() => setSelectedCollection(collection)}
                  className={`px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-sm font-semibold transition-all duration-200 touch-manipulation ${
                    selectedCollection === collection
                      ? 'bg-button text-button-text shadow-md'
                      : 'bg-primary/60 text-foreground hover:bg-primary border border-foreground/10'
                  }`}
                >
                  {collection.charAt(0).toUpperCase() + collection.slice(1)}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-foreground/70">No products found in this collection.</p>
              </div>
            ) : (
              <div className="grid grid-auto-fill-lg gap-6 sm:gap-8 items-stretch [&>*]:min-w-0">
                {filteredProducts.map((product) => (
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


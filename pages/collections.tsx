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

export default function Collections() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const { addItem } = useCart();

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
      <div className="bg-primary py-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-30" style={{
          background: 'radial-gradient(ellipse at center, rgba(220, 38, 38, 0.1) 0%, transparent 70%)'
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Collections
          </h1>
          <p className="text-xl text-foreground/80">
            Explore our curated collections of handcrafted treasures
          </p>
        </div>
      </div>

      <section className="py-12 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Collection Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {collections.map((collection) => (
              <button
                key={collection}
                onClick={() => setSelectedCollection(collection)}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                  selectedCollection === collection
                    ? 'bg-button text-button-text shadow-lg transform scale-105'
                    : 'bg-primary/60 text-foreground hover:bg-primary'
                }`}
              >
                {collection.charAt(0).toUpperCase() + collection.slice(1)}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-foreground/70">No products found in this collection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
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


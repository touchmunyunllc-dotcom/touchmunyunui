import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { HeroSlider } from '@/components/HeroSlider';
import { Features } from '@/components/Features';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Chatbot } from '@/components/Chatbot';
import { CollectionBanner } from '@/components/CollectionBanner';
import { WhatsAppSupport } from '@/components/WhatsAppSupport';
import { SEO } from '@/components/SEO';
import { StructuredData } from '@/components/StructuredData';
import { productService, Product } from '@/services/productService';
import { slideshowService, Slide } from '@/services/slideshowService';
import { useCart } from '@/context/CartContext';
import { notificationService } from '@/services/notificationService';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [slidesLoading, setSlidesLoading] = useState(true);
  const { addItem } = useCart();
  
  // Limit to 8 featured products for homepage preview
  const FEATURED_PRODUCTS_LIMIT = 8;

  // Fallback slides from local sports images
  const fallbackSlides: Slide[] = [
    {
      id: 'fallback-1',
      imageUrl: '/images/sports/Slide1.jpeg',
      alt: 'Sports slide 1',
      title: 'Handcrafted fashion for',
      subtitle: 'bold, modern sportswear.',
      ctaText: 'Shop Now',
      ctaLink: '/products',
      order: 1,
      isActive: true,
    },
    {
      id: 'fallback-2',
      imageUrl: '/images/sports/Slide2.jpeg',
      alt: 'Sports slide 2',
      title: 'Premium Quality',
      subtitle: 'Discover our curated collection of premium handcrafted treasures',
      ctaText: 'Explore Products',
      ctaLink: '/products',
      order: 2,
      isActive: true,
    },
    {
      id: 'fallback-3',
      imageUrl: '/images/sports/Slide3.jpeg',
      alt: 'Sports slide 3',
      title: 'Dynamic Sports Collection',
      subtitle: 'From football to tennis, experience the dynamics of sports',
      ctaText: 'View Collection',
      ctaLink: '/products',
      order: 3,
      isActive: true,
    },
    {
      id: 'fallback-4',
      imageUrl: '/images/sports/Slide4.jpeg',
      alt: 'Sports slide 4',
      title: 'Artistry Meets Sophistication',
      subtitle: 'Unique handcrafted treasures that elevate your lifestyle',
      ctaText: 'Shop Now',
      ctaLink: '/products',
      order: 4,
      isActive: true,
    },
    {
      id: 'fallback-5',
      imageUrl: '/images/sports/Slide5.jpeg',
      alt: 'Sports slide 5',
      title: 'Premium Sportswear',
      subtitle: 'Handpicked selections from our premium collection',
      ctaText: 'Discover More',
      ctaLink: '/products',
      order: 5,
      isActive: true,
    },
    {
      id: 'fallback-6',
      imageUrl: '/images/sports/Slide6.jpeg',
      alt: 'Sports slide 6',
      title: 'Elevate Your Style',
      subtitle: 'Where passion meets performance in every piece',
      ctaText: 'Start Shopping',
      ctaLink: '/products',
      order: 6,
      isActive: true,
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await productService.getAll();
        const data = Array.isArray(result) ? result : result.products;
        setProducts(data);
      } catch (error) {
        notificationService.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    const fetchSlides = async () => {
      try {
        const data = await slideshowService.getActive();
        console.log('Slides loaded from API:', data);
        // If API returns slides, use them; otherwise use fallback
        if (data && data.length > 0) {
          setSlides(data);
        } else {
          console.log('No slides from API, using fallback sports images');
          setSlides(fallbackSlides);
        }
      } catch (error: any) {
        console.error('Failed to load slideshow from API:', error);
        console.error('Error details:', error.response?.data || error.message);
        // Use fallback slides when API fails
        console.log('Using fallback sports images due to API error');
        setSlides(fallbackSlides);
      } finally {
        setSlidesLoading(false);
      }
    };

    fetchProducts();
    fetchSlides();
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

  // Get featured products (limit to 8, show newest products in stock)
  const featuredProducts = products
    .filter(p => p.stock > 0)
    .slice(0, FEATURED_PRODUCTS_LIMIT);

  return (
    <>
      <SEO
        title="TouchMunyun - Handcrafted Fashion for Bold, Modern Sportswear"
        description="where artistry meets sophistication, offering unique handcrafted treasures that elevate your lifestyle. Shop premium handcrafted sportswear and fashion accessories."
        keywords="handcrafted fashion, sportswear, modern fashion, premium clothing, unique accessories, TouchMunyun, handcrafted treasures, lifestyle products, e-commerce"
      />
      <StructuredData type="WebSite" />
      <Layout>
        {/* Collection Banner */}
        <CollectionBanner />
        
      {slidesLoading ? (
        <div className="relative overflow-hidden bg-black h-[500px] sm:h-[600px] lg:h-[700px] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <HeroSlider slides={slides.length > 0 ? slides : fallbackSlides} autoPlayInterval={5000} />
      )}
      
      {/* Value Proposition Section with Dramatic Sports Background */}
      <section className="py-24 md:py-32 bg-black relative overflow-hidden">
        {/* Dramatic Sports Background - Basketball Style */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
          }}
        >
          {/* Minimal Overlay - Maximum Background Visibility Like Basketball Image */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-black/30" />
          
          {/* Very Subtle Lighting Overlay - Just for Depth */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.4) 100%)'
            }}
          />
          
          {/* Subtle Red Accent Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/8 via-transparent to-red-600/5" />
          
          {/* Subtle Gold Accent Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-transparent to-gold-600/4" />
        </div>

        {/* Floating Sports Elements - Minimal opacity for maximum text clarity */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-600/5 rounded-full blur-3xl animate-float animation-delay-200" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gold-600/5 rounded-full blur-3xl animate-float animation-delay-400" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Text Container with Strong Background for Maximum Clarity */}
            <div className="inline-block bg-black/70 backdrop-blur-md rounded-3xl px-10 py-8 md:px-16 md:py-12 border-2 border-white/20 shadow-2xl">
              <h2 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-8 drop-shadow-[0_6px_20px_rgba(0,0,0,1)] leading-tight tracking-tight">
                <span className="block mb-2">Handcrafted fashion for</span>
                <span className="block text-red-600 drop-shadow-[0_6px_20px_rgba(220,38,38,1)]">bold, modern sportswear.</span>
              </h2>
              <p className="text-2xl sm:text-3xl md:text-4xl text-white max-w-4xl mx-auto leading-relaxed drop-shadow-[0_4px_16px_rgba(0,0,0,1)] font-bold">
                where artistry meets sophistication, offering unique handcrafted treasures that elevate your lifestyle.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Features />

      {/* Featured Products Preview Section */}
      <section id="products" className="py-20 bg-black relative overflow-hidden">
        {/* Dynamic Sports Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
          }}
        >
          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-black/85" />
          
          {/* Red Accent Overlay for Sports Energy */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/15 via-transparent to-red-600/10" />
          
          {/* Gold Accent Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-transparent to-gold-600/5" />
          
          {/* Animated Sports Pattern Overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 20 L60 50 L50 40 L40 50 Z' fill='%23dc2626' opacity='0.3'/%3E%3Ccircle cx='20' cy='20' r='3' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='80' cy='80' r='3' fill='%23ffffff' opacity='0.2'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
              animation: 'shimmer 20s linear infinite',
            }} />
          </div>
        </div>

        {/* Floating Sports Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-red-600/20 rounded-full blur-xl animate-float animation-delay-200" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gold-600/20 rounded-full blur-2xl animate-float animation-delay-400" />
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-white/10 rounded-full blur-lg animate-float animation-delay-600" />
        <div className="absolute bottom-1/4 left-20 w-24 h-24 bg-red-600/15 rounded-full blur-xl animate-float animation-delay-300" />
        <div className="absolute top-1/4 left-1/3 w-28 h-28 bg-gold-600/15 rounded-full blur-2xl animate-float animation-delay-500" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Featured Products
            </h2>
            <p className="text-xl text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Handpicked selections from our premium collection
            </p>
          </div>

          {/* Featured Products Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-white/70">No featured products available at the moment.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {featuredProducts.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  </Link>
                ))}
              </div>
              
              {/* View All Products CTA */}
              <div className="text-center">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-glow-red"
                >
                  View All Products
                  <svg
                    className="ml-2 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Chatbot */}
      <Chatbot />
      
      {/* WhatsApp Support */}
      <WhatsAppSupport />
      </Layout>
    </>
  );
}

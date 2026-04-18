import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { SEO } from '@/components/SEO';
import { productService, Product } from '@/services/productService';
import { useCart } from '@/context/CartContext';
import { notificationService } from '@/services/notificationService';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'newest';
type ViewMode = 'grid' | 'list';

export default function Products() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const { addItem } = useCart();

  // Initialize search query from URL
  useEffect(() => {
    if (router.query.search && typeof router.query.search === 'string') {
      setSearchQuery(router.query.search);
    }
  }, [router.query.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Use search query from URL or state
        const search = (router.query.search as string) || searchQuery;
        const filters = search ? { search } : undefined;
        const result = await productService.getAll(filters);
        const data = Array.isArray(result) ? result : result.products;
        setProducts(data);
        // Set max price from products
        const maxPrice = Math.max(...data.map((p: Product) => p.price), 1000);
        setPriceRange([0, maxPrice]);
      } catch (error) {
        notificationService.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [router.query.search, searchQuery]);

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

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    return ['all', ...cats];
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Filter by category (client-side since API already filtered by search)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Search is handled server-side via API, no need for client-side filtering

    // Filter by price range
    filtered = filtered.filter(
      p => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Sort products
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
        default:
          return 0; // Keep original order for newest
      }
    });

    return sorted;
  }, [products, selectedCategory, searchQuery, sortOption, priceRange]);

  const maxPrice = Math.max(...products.map(p => p.price), 1000);

  return (
    <>
      <SEO
        title="Products - Touch Munyun | Performance Accessories & Apparel"
        description="Browse Touch Munyun's full collection of performance accessories and apparel for athletes and grinders. Wristbands, headbands, hoodies, shirts, pants, socks, and more."
        keywords="Touch Munyun products, sports accessories, performance apparel, wristbands, headbands, hoodies, shirts, athletic wear"
      />
      <Layout>
      {/* Hero Header */}
      <div className="bg-primary py-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-30" style={{
          background: 'radial-gradient(ellipse at center, rgba(90, 93, 104, 0.1) 0%, transparent 70%)'
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6">
              <span className="block text-foreground">
                Our Products
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto">
              Discover our curated collection of premium handcrafted treasures
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Controls Bar */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/80 backdrop-blur-sm text-foreground placeholder-foreground/50 shadow-glass"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Results Count */}
              <div className="text-foreground/70">
                <span className="font-semibold">{filteredAndSortedProducts.length}</span> product
                {filteredAndSortedProducts.length !== 1 ? 's' : ''} found
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Filter Toggle (Mobile) */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-primary/80 border border-foreground/20 rounded-lg hover:bg-primary text-foreground"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filters
                </button>

                {/* Sort Dropdown */}
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="px-4 py-2 bg-primary/80 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-button/50 focus:border-transparent text-foreground"
                >
                  <option value="newest">Newest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-primary/80 border border-foreground/20 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${
                      viewMode === 'grid'
                        ? 'bg-button text-button-text'
                        : 'text-foreground/70 hover:bg-primary'
                    }`}
                    aria-label="Grid view"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${
                      viewMode === 'list'
                        ? 'bg-button text-button-text'
                        : 'text-foreground/70 hover:bg-primary'
                    }`}
                    aria-label="List view"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside
              className={`lg:w-64 flex-shrink-0 ${
                showFilters ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="bg-primary/80 rounded-lg shadow-sm p-6 space-y-6 sticky top-4 border border-foreground/20">
                <h2 className="text-lg font-bold text-foreground">Filters</h2>

                {/* Category Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Category</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === category
                            ? 'bg-button text-button-text'
                            : 'bg-primary/60 text-foreground hover:bg-primary'
                        }`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value)])
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-foreground/70">
                      <span>$0</span>
                      <span>${maxPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                {(selectedCategory !== 'all' ||
                  searchQuery ||
                  priceRange[0] > 0 ||
                  priceRange[1] < maxPrice) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                      setPriceRange([0, maxPrice]);
                    }}
                    className="w-full px-4 py-2 text-sm text-button border border-button rounded-lg hover:bg-button/20"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </aside>

            {/* Products Grid/List */}
            <div className="flex-1">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <LoadingSpinner size="lg" />
                </div>
              ) : filteredAndSortedProducts.length === 0 ? (
                <EmptyState
                  variant="search"
                  title="No products found"
                  description="Try adjusting your filters or search query to find what you're looking for."
                  action={{
                    label: 'Clear Filters',
                    onClick: () => {
                      setSearchQuery('');
                      setSelectedCategory('');
                      setSortOption('name-asc');
                    },
                  }}
                />
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAndSortedProducts.map((product) => (
                    <Link key={product.id} href={`/product/${product.id}`}>
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                      />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedProducts.map((product) => (
                    <Link key={product.id} href={`/product/${product.id}`}>
                      <div className="bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col sm:flex-row gap-6 border border-gray-800">
                        <div className="relative w-full sm:w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className="inline-block px-2 py-1 text-xs font-semibold text-primary-600 bg-primary-50 rounded mb-2">
                                {product.category}
                              </span>
                              <h3 className="text-xl font-bold text-primary-500 mb-2">
                                {product.name}
                              </h3>
                            </div>
                            <span className="text-2xl font-bold text-primary-500">
                              ${product.price.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-gray-400 mb-4 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                product.stock > 0
                                  ? 'text-green-600 bg-green-50'
                                  : 'text-red-600 bg-red-50'
                              }`}
                            >
                              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleAddToCart(product);
                              }}
                              disabled={product.stock === 0}
                              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      </Layout>
    </>
  );
}

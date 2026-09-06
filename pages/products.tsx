import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardGallery } from '@/components/ProductCardGallery';
import { ProductPurchaseActions } from '@/components/ProductPurchaseActions';
import { ProductAudienceBadge } from '@/components/ProductAudienceBadge';
import { EmptyState } from '@/components/EmptyState';
import { ProductGridSkeleton } from '@/components/skeletons/ProductCardSkeleton';
import { Pagination } from '@/components/Pagination';
import { SEO } from '@/components/SEO';
import { productService, Product } from '@/services/productService';
import { notificationService } from '@/services/notificationService';
import { productHref } from '@/lib/productRoutes';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'newest';
type ViewMode = 'grid' | 'list';

const STORE_PAGE_SIZE_OPTIONS = [8, 16, 24] as const;

export default function Products() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchInput, setSearchInput] = useState<string>('');
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(STORE_PAGE_SIZE_OPTIONS[0]);

  // Initialize search from URL
  useEffect(() => {
    if (!router.isReady) return;
    const urlSearch = typeof router.query.search === 'string' ? router.query.search : '';
    setSearchInput(urlSearch);
  }, [router.isReady, router.query.search]);

  // Sync debounced search to URL (shareable, back-button friendly)
  useEffect(() => {
    if (!router.isReady) return;
    const current = typeof router.query.search === 'string' ? router.query.search : '';
    const next = debouncedSearch.trim();
    if (next === current) return;

    const query = next ? { search: next } : {};
    void router.replace({ pathname: '/products', query }, undefined, { shallow: true, scroll: false });
  }, [debouncedSearch, router.isReady, router.query.search, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const search =
          typeof router.query.search === 'string' ? router.query.search.trim() : '';
        const filters = search ? { search } : undefined;
        const result = await productService.getAll(filters);
        const data = Array.isArray(result) ? result : result.products;
        setProducts(data);
        const maxPrice = Math.max(...data.map((p: Product) => p.price), 1000);
        setPriceRange([0, maxPrice]);
      } catch (error) {
        notificationService.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) {
      void fetchProducts();
    }
  }, [router.isReady, router.query.search]);

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
  }, [products, selectedCategory, sortOption, priceRange]);

  const pagedProducts = useMemo(() => {
    const totalCount = filteredAndSortedProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * pageSize;
    return {
      items: filteredAndSortedProducts.slice(start, start + pageSize),
      totalCount,
      totalPages,
      page: safePage,
    };
  }, [filteredAndSortedProducts, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, debouncedSearch, sortOption, priceRange]);

  useEffect(() => {
    if (page > pagedProducts.totalPages) {
      setPage(pagedProducts.totalPages);
    }
  }, [page, pagedProducts.totalPages]);

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const maxPrice = Math.max(...products.map(p => p.price), 1000);

  return (
    <>
      <SEO
        title="Products - Touch Munyun | Performance Accessories & Apparel"
        description="Browse Touch Munyun's full collection of performance accessories and apparel for athletes and grinders. Wristbands, headbands, hoodies, shirts, pants, socks, and more."
        keywords="Touch Munyun products, sports accessories, performance apparel, wristbands, headbands, hoodies, shirts, athletic wear"
      />
      <Layout>
      <section className="bg-black pb-8 overflow-x-hidden">
        <div className="page-shell pt-4">
          <div className="mb-4 border-b border-white/10 pb-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Our <span className="text-red-500">Products</span>
            </h1>
          </div>

          {/* Toolbar */}
          <div className="sticky-below-nav py-3 mb-4 bg-black/95 backdrop-blur-sm border-b border-white/10 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-white/15 rounded-lg focus:ring-2 focus:ring-red-600/50 focus:border-red-600/50 bg-white/5 text-white placeholder-white/40"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50"
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

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2 max-h-28 overflow-y-auto overscroll-y-contain sm:max-h-none sm:overflow-visible">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        selectedCategory === category
                          ? 'bg-red-600 text-white'
                          : 'bg-white/10 text-white/80 hover:bg-white/15 border border-white/10'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  <span className="text-xs text-white/60 w-full sm:w-auto">
                    <span className="font-semibold text-white">{filteredAndSortedProducts.length}</span> found
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-1.5 px-3 py-2 min-h-[2.5rem] bg-white/10 border border-white/10 rounded-lg text-white text-xs hover:bg-white/15"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    Price
                  </button>

                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="min-w-0 flex-1 sm:flex-none px-3 py-2 min-h-[2.5rem] bg-white/10 border border-white/10 rounded-lg text-white text-xs focus:ring-2 focus:ring-red-600/50"
                  >
                    <option value="newest">Newest First</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="price-asc">Price (Low to High)</option>
                    <option value="price-desc">Price (High to Low)</option>
                  </select>

                  <div className="flex items-center gap-0.5 bg-white/10 border border-white/10 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded ${
                        viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-white/70 hover:text-white'
                      }`}
                      aria-label="Grid view"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded ${
                        viewMode === 'list' ? 'bg-red-600 text-white' : 'text-white/70 hover:text-white'
                      }`}
                      aria-label="List view"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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

              {showFilters && (
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white mb-2">
                        Price: ${priceRange[0]} – ${priceRange[1]}
                      </p>
                      <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full accent-red-600"
                      />
                      <div className="flex justify-between text-xs text-white/50 mt-1">
                        <span>$0</span>
                        <span>${maxPrice}</span>
                      </div>
                    </div>
                    {(selectedCategory !== 'all' ||
                      searchInput ||
                      priceRange[0] > 0 ||
                      priceRange[1] < maxPrice) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('all');
                          setSearchInput('');
                          setPriceRange([0, maxPrice]);
                          void router.replace('/products', undefined, { shallow: true, scroll: false });
                        }}
                        className="shrink-0 px-4 py-2 text-sm text-red-400 border border-red-600/40 rounded-xl hover:bg-red-600/10"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Grid/List — full width, smooth vertical scroll only */}
          <div>
              {loading ? (
                <ProductGridSkeleton count={pageSize} compact />
              ) : filteredAndSortedProducts.length === 0 ? (
                <EmptyState
                  variant="search"
                  title="No products found"
                  description="Try adjusting your filters or search query to find what you're looking for."
                  action={{
                    label: 'Clear Filters',
                    onClick: () => {
                      setSearchInput('');
                      setSelectedCategory('all');
                      setSortOption('name-asc');
                      void router.replace('/products', undefined, { shallow: true, scroll: false });
                    },
                  }}
                />
              ) : viewMode === 'grid' ? (
                <div className="grid grid-auto-fill-catalog gap-4 items-stretch [&>*]:min-w-0">
                  {pagedProducts.items.map((product) => (
                    <ProductCard key={product.id} product={product} compact />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {pagedProducts.items.map((product) => (
                    <div
                      key={product.id}
                      className="group bg-white/5 rounded-xl hover:bg-white/[0.07] transition-colors p-3 sm:p-4 flex flex-col sm:flex-row gap-3 border border-white/10"
                    >
                      <Link
                        href={productHref(product.id)}
                        className="relative w-full sm:w-28 shrink-0 rounded-lg overflow-hidden block"
                      >
                        <ProductCardGallery product={product} variant="list" showDots={false} />
                      </Link>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <Link href={productHref(product.id)} className="block min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold text-white/90 bg-white/10 border border-white/15 rounded">
                                  {product.category}
                                </span>
                                <ProductAudienceBadge product={product} compact />
                              </div>
                              <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                                {product.name}
                              </h3>
                            </div>
                            <span className="text-base font-bold text-red-500 shrink-0">
                              ${(product.salePrice ?? product.price).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-white/60 text-xs line-clamp-2 sm:line-clamp-1">
                            {product.description}
                          </p>
                        </Link>
                        <ProductPurchaseActions product={product} compact />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && pagedProducts.totalCount > 0 && (
                <div className="mt-4 [&>div]:mt-0 [&>div]:p-3 [&>div]:rounded-xl">
                  <Pagination
                  page={pagedProducts.page}
                  pageSize={pageSize}
                  totalCount={pagedProducts.totalCount}
                  totalPages={pagedProducts.totalPages}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  pageSizeOptions={STORE_PAGE_SIZE_OPTIONS}
                  itemLabel="products"
                />
                </div>
              )}
          </div>
        </div>
      </section>
      </Layout>
    </>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { productService, Product } from '@/services/productService';
import { notificationService } from '@/services/notificationService';
import { Pagination } from '@/components/Pagination';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  adminGridWrapperClassName,
  adminGridScrollClassName,
  adminGridTableClassName,
  adminGridHeadClassName,
  adminGridHeadCellCompactClassName,
  adminGridBodyClassName,
  adminGridRowClassName,
  adminGridRowSelectedClassName,
  adminGridCellCompactClassName,
  adminGridEmptyClassName,
  adminSelectClassName,
  adminSelectOptionProps,
} from '@/lib/adminFormStyles';
import { adminDashboardHref, getAdminReturnTab, getAdminBackLabel } from '@/lib/adminDashboard';
import {
  AdminActiveStatusFilter,
  AdminStatusBadge,
  AdminStatusFilter,
  AdminStatusToggleButton,
} from '@/components/admin/AdminActiveStatus';

const inputClassName =
  'w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 transition-all';

export default function AdminProducts() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const dashboardReturnTab = getAdminReturnTab('actions');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminActiveStatusFilter>('all');
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [editingPrice, setEditingPrice] = useState<{ id: string; field: 'price' | 'salePrice' } | null>(null);
  const [priceValue, setPriceValue] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [bulkPriceData, setBulkPriceData] = useState({
    price: '',
    salePrice: '',
    adjustmentType: 'percentage' as 'percentage' | 'fixed',
    adjustmentValue: '',
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
      return;
    }

    fetchProducts();
  }, [isAuthenticated, user, router, pagination.page, pagination.pageSize, searchQuery, categoryFilter, statusFilter]);

  const handlePageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, page: 1, pageSize }));
  };

  const fetchProducts = async () => {
    try {
      if (loading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const result = await productService.getAll({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: searchQuery.trim() || undefined,
        category: categoryFilter || undefined,
        status: statusFilter,
      });
      
      if (Array.isArray(result)) {
        // Backward compatibility
        setProducts(result);
        setPagination(prev => ({ ...prev, totalCount: result.length, totalPages: 1 }));
      } else {
        setProducts(result.products);
        setPagination((prev) => ({
          ...prev,
          totalCount: result.totalCount,
          totalPages:
            result.totalPages || Math.max(1, Math.ceil(result.totalCount / prev.pageSize)),
        }));
      }
    } catch (error) {
      notificationService.error('Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const pageStats = useMemo(() => {
    const onSale = products.filter((product) => product.salePrice != null && product.salePrice > 0).length;
    const outOfStock = products.filter((product) => product.stock <= 0).length;
    const inStock = products.length - outOfStock;
    return { onSale, outOfStock, inStock };
  }, [products]);

  const categoryOptions = useMemo(() => {
    const categories = new Set(products.map((product) => product.category).filter(Boolean));
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const handleToggleStatus = async (product: Product) => {
    const nextActive = !(product.isActive ?? true);
    const action = nextActive ? 'activate' : 'deactivate';
    if (!confirm(`Are you sure you want to ${action} "${product.name}"?`)) return;

    try {
      setTogglingStatusId(product.id);
      await productService.update(product.id, { isActive: nextActive });
      notificationService.success(`Product ${nextActive ? 'activated' : 'deactivated'}`);
      fetchProducts();
    } catch (error: any) {
      notificationService.error(error.response?.data?.message || `Failed to ${action} product`);
    } finally {
      setTogglingStatusId(null);
    }
  };

  const handlePriceEdit = (product: Product, field: 'price' | 'salePrice') => {
    setEditingPrice({ id: product.id, field });
    setPriceValue(field === 'price' ? product.price.toString() : (product.salePrice?.toString() || ''));
  };

  const handlePriceSave = async (productId: string) => {
    if (!editingPrice) return;

    try {
      const value = parseFloat(priceValue);
      if (isNaN(value) || value < 0) {
        notificationService.error('Please enter a valid price');
        return;
      }

      if (editingPrice.field === 'price') {
        await productService.updatePrice(productId, value);
      } else {
        await productService.updatePrice(productId, undefined, value || undefined);
      }

      notificationService.success('Price updated successfully');
      setEditingPrice(null);
      setPriceValue('');
      fetchProducts();
    } catch (error: any) {
      notificationService.error(error.response?.data?.message || 'Failed to update price');
    }
  };

  const handlePriceCancel = () => {
    setEditingPrice(null);
    setPriceValue('');
  };

  const handleBulkPriceUpdate = async () => {
    if (selectedProducts.size === 0) {
      notificationService.error('Please select at least one product');
      return;
    }

    try {
      const productIds = Array.from(selectedProducts);
      const options: any = {};

      if (bulkPriceData.price) {
        options.price = parseFloat(bulkPriceData.price);
      }

      if (bulkPriceData.salePrice) {
        options.salePrice = parseFloat(bulkPriceData.salePrice);
      }

      if (bulkPriceData.adjustmentValue && bulkPriceData.adjustmentType) {
        options.adjustmentType = bulkPriceData.adjustmentType;
        options.adjustmentValue = parseFloat(bulkPriceData.adjustmentValue);
      }

      await productService.bulkUpdatePrices(productIds, options);
      notificationService.success(`Updated prices for ${productIds.length} products`);
      setShowBulkPriceModal(false);
      setSelectedProducts(new Set());
      setBulkPriceData({ price: '', salePrice: '', adjustmentType: 'percentage', adjustmentValue: '' });
      fetchProducts();
    } catch (error: any) {
      notificationService.error(error.response?.data?.message || 'Failed to update prices');
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-primary">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-primary min-h-screen">
        <div className="mb-4">
          <Link
            href={adminDashboardHref(dashboardReturnTab)}
            className="inline-flex items-center text-button hover:text-button-200 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {getAdminBackLabel(dashboardReturnTab)}
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Products</h1>
            <p className="text-foreground/60 text-sm mt-1">
              Manage catalog, pricing, inventory, and storefront flags
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {selectedProducts.size > 0 && (
              <button
                type="button"
                onClick={() => setShowBulkPriceModal(true)}
                className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-500 flex items-center gap-2 font-semibold shadow-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Bulk Prices ({selectedProducts.size})
              </button>
            )}
            <button
              type="button"
              onClick={() => router.push('/admin/products/new')}
              className="bg-button text-button-text px-5 py-2.5 rounded-xl hover:bg-button-200 font-semibold shadow-lg transition-all"
            >
              Add Product
            </button>
          </div>
        </div>

        <div className="grid grid-auto-fill-md gap-4 mb-6">
          {[
            { label: 'Total Products', value: pagination.totalCount, color: 'from-blue-500 to-blue-600' },
            { label: 'In Stock (page)', value: pageStats.inStock, color: 'from-green-500 to-green-600' },
            { label: 'On Sale (page)', value: pageStats.onSale, color: 'from-gold-500 to-gold-600' },
            { label: 'Out of Stock (page)', value: pageStats.outOfStock, color: 'from-red-500 to-red-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-md">
              <div className={`bg-gradient-to-br ${stat.color} px-4 py-4 text-white`}>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/90">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-primary/80 backdrop-blur-xl rounded-2xl shadow-glass-lg p-4 mb-4 border border-foreground/10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-white mb-2">Search products</label>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                placeholder="Search by name or description..."
                className={inputClassName}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className={adminSelectClassName}
              >
                <option value="" {...adminSelectOptionProps}>All categories</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category} {...adminSelectOptionProps}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Status</label>
              <AdminStatusFilter
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {selectedProducts.size > 0 && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 flex flex-wrap items-center justify-between gap-3">
            <span>{selectedProducts.size} product{selectedProducts.size === 1 ? '' : 's'} selected</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedProducts(new Set())}
                className="px-3 py-1.5 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/10 transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setShowBulkPriceModal(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors font-medium"
              >
                Update prices
              </button>
            </div>
          </div>
        )}

        <div className={refreshing ? 'opacity-60 pointer-events-none' : ''}>
          {products.length === 0 ? (
            <div className={adminGridEmptyClassName}>
              No products found. Try adjusting search or add a new product.
            </div>
          ) : (
            <div className={adminGridWrapperClassName}>
              <div className={adminGridScrollClassName}>
                <table className={`${adminGridTableClassName} min-w-[980px] w-full`}>
                  <thead className={adminGridHeadClassName}>
                    <tr>
                      <th className={adminGridHeadCellCompactClassName}>
                        <input
                          type="checkbox"
                          checked={selectedProducts.size === products.length && products.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-foreground/30 text-button focus:ring-button/50 w-4 h-4"
                          aria-label="Select all products on this page"
                        />
                      </th>
                      <th className={adminGridHeadCellCompactClassName}>Product</th>
                      <th className={adminGridHeadCellCompactClassName}>Regular</th>
                      <th className={adminGridHeadCellCompactClassName}>Sale</th>
                      <th className={adminGridHeadCellCompactClassName}>Stock</th>
                      <th className={adminGridHeadCellCompactClassName}>Status</th>
                      <th className={adminGridHeadCellCompactClassName}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={adminGridBodyClassName}>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className={`group ${selectedProducts.has(product.id) ? adminGridRowSelectedClassName : adminGridRowClassName}`}
                      >
                        <td className={`${adminGridCellCompactClassName} whitespace-nowrap`}>
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="rounded border-foreground/30 text-button focus:ring-button/50 w-4 h-4"
                            aria-label={`Select ${product.name}`}
                          />
                        </td>
                        <td className={adminGridCellCompactClassName}>
                          <div className="flex items-center gap-3 min-w-[220px]">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="relative w-10 h-10 rounded-lg overflow-hidden border border-foreground/20 hover:border-button/60 transition-colors shrink-0"
                            >
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </Link>
                            <div className="min-w-0">
                              <Link
                                href={`/admin/products/${product.id}/edit`}
                                className="text-sm font-semibold text-foreground hover:text-button transition-colors line-clamp-1"
                              >
                                {product.name}
                              </Link>
                              <p className="text-xs text-foreground/50 mt-0.5 capitalize">{product.category || 'Uncategorized'}</p>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {product.isNewArrival && (
                                  <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    New
                                  </span>
                                )}
                                {product.isBestSeller && (
                                  <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gold-500/20 text-gold-300 border border-gold-500/30">
                                    Best
                                  </span>
                                )}
                                {product.isFeatured && (
                                  <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    Featured
                                  </span>
                                )}
                                {product.salePrice != null && product.salePrice > 0 && (
                                  <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    Sale
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`${adminGridCellCompactClassName} whitespace-nowrap`}>
                          {editingPrice?.id === product.id && editingPrice.field === 'price' ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={priceValue}
                                onChange={(e) => setPriceValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handlePriceSave(product.id);
                                  if (e.key === 'Escape') handlePriceCancel();
                                }}
                                className="w-20 px-2 py-1 border border-foreground/20 rounded-lg text-sm bg-primary/60 text-foreground focus:ring-2 focus:ring-button/50"
                                autoFocus
                              />
                              <button type="button" onClick={() => handlePriceSave(product.id)} className="text-emerald-400 hover:text-emerald-300">✓</button>
                              <button type="button" onClick={handlePriceCancel} className="text-red-400 hover:text-red-300">✕</button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="text-sm text-foreground/80 hover:text-gold-400 font-medium tabular-nums"
                              onClick={() => handlePriceEdit(product, 'price')}
                              title="Click to edit"
                            >
                              ${product.price.toFixed(2)}
                            </button>
                          )}
                        </td>
                        <td className={`${adminGridCellCompactClassName} whitespace-nowrap`}>
                          {editingPrice?.id === product.id && editingPrice.field === 'salePrice' ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={priceValue}
                                onChange={(e) => setPriceValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handlePriceSave(product.id);
                                  if (e.key === 'Escape') handlePriceCancel();
                                }}
                                className="w-20 px-2 py-1 border border-foreground/20 rounded-lg text-sm bg-primary/60 text-foreground focus:ring-2 focus:ring-button/50"
                                autoFocus
                              />
                              <button type="button" onClick={() => handlePriceSave(product.id)} className="text-emerald-400 hover:text-emerald-300">✓</button>
                              <button type="button" onClick={handlePriceCancel} className="text-red-400 hover:text-red-300">✕</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {product.salePrice ? (
                                <span className="text-sm font-semibold text-gold-400 tabular-nums">${product.salePrice.toFixed(2)}</span>
                              ) : (
                                <span className="text-sm text-foreground/40">—</span>
                              )}
                              <button
                                type="button"
                                onClick={() => handlePriceEdit(product, 'salePrice')}
                                className="text-xs text-button hover:text-button-200 transition-colors"
                              >
                                {product.salePrice ? 'Edit' : 'Add'}
                              </button>
                            </div>
                          )}
                        </td>
                        <td className={`${adminGridCellCompactClassName} whitespace-nowrap`}>
                          <span
                            className={`inline-flex min-w-[2.5rem] justify-center text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums ${
                              product.stock > 10
                                ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/30'
                                : product.stock > 0
                                  ? 'text-gold-300 bg-gold-500/20 border border-gold-500/30'
                                  : 'text-red-300 bg-red-500/20 border border-red-500/30'
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className={`${adminGridCellCompactClassName} whitespace-nowrap`}>
                          <AdminStatusBadge isActive={product.isActive ?? true} />
                        </td>
                        <td className={`${adminGridCellCompactClassName} whitespace-nowrap`}>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-foreground/20 text-foreground hover:border-button/50 hover:text-button transition-colors"
                            >
                              Edit
                            </button>
                            <AdminStatusToggleButton
                              isActive={product.isActive ?? true}
                              onToggle={() => handleToggleStatus(product)}
                              disabled={togglingStatusId === product.id}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalCount={pagination.totalCount}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          onPageSizeChange={handlePageSizeChange}
          itemLabel="products"
        />

        {showBulkPriceModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-md w-full border border-gray-800 shadow-2xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600" />
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    Bulk Price Update ({selectedProducts.size})
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowBulkPriceModal(false)}
                    className="text-foreground/60 hover:text-foreground transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Set Regular Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={bulkPriceData.price}
                      onChange={(e) => setBulkPriceData({ ...bulkPriceData, price: e.target.value })}
                      className={inputClassName}
                      placeholder="Leave empty to keep current"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Set Sale Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={bulkPriceData.salePrice}
                      onChange={(e) => setBulkPriceData({ ...bulkPriceData, salePrice: e.target.value })}
                      className={inputClassName}
                      placeholder="Leave empty to keep current"
                    />
                  </div>

                  <div className="border-t border-foreground/10 pt-5">
                    <label className="block text-sm font-semibold text-white mb-2">Or Adjust Prices By</label>
                    <div className="flex gap-2">
                      <select
                        value={bulkPriceData.adjustmentType}
                        onChange={(e) =>
                          setBulkPriceData({ ...bulkPriceData, adjustmentType: e.target.value as 'percentage' | 'fixed' })
                        }
                        className={adminSelectClassName}
                      >
                        <option value="percentage" {...adminSelectOptionProps}>Percentage (%)</option>
                        <option value="fixed" {...adminSelectOptionProps}>Fixed Amount ($)</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        value={bulkPriceData.adjustmentValue}
                        onChange={(e) => setBulkPriceData({ ...bulkPriceData, adjustmentValue: e.target.value })}
                        className={`${inputClassName} flex-1`}
                        placeholder={bulkPriceData.adjustmentType === 'percentage' ? 'e.g., 10 for +10%' : 'e.g., 5 for +$5'}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowBulkPriceModal(false)}
                      className="px-6 py-3 border border-foreground/20 rounded-xl text-foreground hover:bg-primary/80 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkPriceUpdate}
                      className="px-6 py-3 bg-button text-button-text rounded-xl hover:bg-button-200 font-semibold shadow-lg transition-all"
                    >
                      Update Prices
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}


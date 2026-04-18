import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { productService, Product } from '@/services/productService';
import { notificationService } from '@/services/notificationService';
import { Pagination } from '@/components/Pagination';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function AdminProducts() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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
  }, [isAuthenticated, user, router, pagination.page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const result = await productService.getAll({
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      
      if (Array.isArray(result)) {
        // Backward compatibility
        setProducts(result);
        setPagination(prev => ({ ...prev, totalCount: result.length, totalPages: 1 }));
      } else {
        setProducts(result.products);
        setPagination({
          ...pagination,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
        });
      }
    } catch (error) {
      notificationService.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productService.delete(id);
      notificationService.success('Product deleted');
      fetchProducts(); // Refresh the list
    } catch (error) {
      notificationService.error('Failed to delete product');
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
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-primary min-h-screen">
        <div className="mb-4">
          <Link
            href="/admin"
            className="inline-flex items-center text-button hover:text-button-200 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-foreground">Admin - Products</h1>
        <div className="flex gap-3">
          {selectedProducts.size > 0 && (
            <button
              onClick={() => setShowBulkPriceModal(true)}
              className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Update Prices ({selectedProducts.size})
            </button>
          )}
          <button
            onClick={() => router.push('/admin/products/new')}
            className="bg-button text-button-text px-6 py-3 rounded-xl hover:bg-button-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Add New Product
          </button>
        </div>
      </div>
      <div className="bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg overflow-hidden border-2 border-foreground/10">
        <table className="min-w-full divide-y divide-foreground/10">
          <thead className="bg-primary/60 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedProducts.size === products.length && products.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-foreground/30 text-button focus:ring-button/50 w-4 h-4"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                Regular Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                Sale Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-primary/40 divide-y divide-foreground/10">
            {products.map((product) => (
              <tr key={product.id} className={`group hover:bg-primary/60 transition-colors ${selectedProducts.has(product.id) ? 'bg-button/10' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                    className="rounded border-foreground/30 text-button focus:ring-button/50 w-4 h-4"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-xl border-2 border-foreground/20 group-hover:border-button/50 transition-colors"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-foreground group-hover:text-button transition-colors">
                    {product.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingPrice?.id === product.id && editingPrice.field === 'price' ? (
                    <div className="flex items-center gap-2">
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
                        className="w-24 px-2 py-1 border border-foreground/20 rounded-lg text-sm bg-primary/60 backdrop-blur-sm text-foreground focus:ring-2 focus:ring-button/50 focus:border-button/50"
                        autoFocus
                      />
                      <button
                        onClick={() => handlePriceSave(product.id)}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        ✓
                      </button>
                      <button
                        onClick={handlePriceCancel}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div
                      className="text-sm text-foreground/70 cursor-pointer hover:text-gold-400 hover:underline transition-colors font-medium"
                      onClick={() => handlePriceEdit(product, 'price')}
                      title="Click to edit"
                    >
                      ${product.price.toFixed(2)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingPrice?.id === product.id && editingPrice.field === 'salePrice' ? (
                    <div className="flex items-center gap-2">
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
                        className="w-24 px-2 py-1 border border-foreground/20 rounded-lg text-sm bg-primary/60 backdrop-blur-sm text-foreground focus:ring-2 focus:ring-button/50 focus:border-button/50"
                        autoFocus
                      />
                      <button
                        onClick={() => handlePriceSave(product.id)}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        ✓
                      </button>
                      <button
                        onClick={handlePriceCancel}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {product.salePrice ? (
                        <span className="text-sm font-semibold text-gold-400">
                          ${product.salePrice.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-sm text-foreground/40">—</span>
                      )}
                      <button
                        onClick={() => handlePriceEdit(product, 'salePrice')}
                        className="text-xs text-button hover:text-button-200 transition-colors"
                        title="Click to edit"
                      >
                        {product.salePrice ? 'Edit' : 'Add'}
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    product.stock > 0 
                      ? 'text-emerald-400 bg-emerald-500/20 border border-emerald-500/30' 
                      : 'text-red-400 bg-red-500/20 border border-red-500/30'
                  }`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                      className="text-button hover:text-button-200 font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-400 hover:text-red-300 font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Pagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalCount={pagination.totalCount}
        totalPages={pagination.totalPages}
        onPageChange={(page) => setPagination({ ...pagination, page })}
      />

      {/* Bulk Price Update Modal */}
      {showBulkPriceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-primary/95 backdrop-blur-xl rounded-3xl max-w-md w-full p-8 border-2 border-foreground/20 shadow-glass-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Bulk Price Update ({selectedProducts.size} products)
              </h2>
              <button
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
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Set Regular Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={bulkPriceData.price}
                  onChange={(e) => setBulkPriceData({ ...bulkPriceData, price: e.target.value })}
                  className="w-full px-4 py-3 border border-foreground/20 rounded-xl bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 transition-all"
                  placeholder="Leave empty to keep current"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Set Sale Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={bulkPriceData.salePrice}
                  onChange={(e) => setBulkPriceData({ ...bulkPriceData, salePrice: e.target.value })}
                  className="w-full px-4 py-3 border border-foreground/20 rounded-xl bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 transition-all"
                  placeholder="Leave empty to keep current"
                />
              </div>

              <div className="border-t border-foreground/10 pt-5">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Or Adjust Prices By
                </label>
                <div className="flex gap-2">
                  <select
                    value={bulkPriceData.adjustmentType}
                    onChange={(e) => setBulkPriceData({ ...bulkPriceData, adjustmentType: e.target.value as 'percentage' | 'fixed' })}
                    className="px-4 py-3 border border-foreground/20 rounded-xl bg-primary/60 backdrop-blur-sm text-foreground focus:ring-2 focus:ring-button/50 focus:border-button/50 transition-all"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={bulkPriceData.adjustmentValue}
                    onChange={(e) => setBulkPriceData({ ...bulkPriceData, adjustmentValue: e.target.value })}
                    className="flex-1 px-4 py-3 border border-foreground/20 rounded-xl bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 transition-all"
                    placeholder={bulkPriceData.adjustmentType === 'percentage' ? 'e.g., 10 for +10%' : 'e.g., 5 for +$5'}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowBulkPriceModal(false)}
                  className="px-6 py-3 border border-foreground/20 rounded-xl text-foreground hover:bg-primary/80 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkPriceUpdate}
                  className="px-6 py-3 bg-button text-button-text rounded-xl hover:bg-button-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Update Prices
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}


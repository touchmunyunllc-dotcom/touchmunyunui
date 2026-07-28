import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { productService } from '@/services/productService';
import { imageService } from '@/services/imageService';
import { notificationService } from '@/services/notificationService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ColorMultiSelect } from '@/components/ColorMultiSelect';

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sizeInput, setSizeInput] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<number[]>([]);
  const [colorImages, setColorImages] = useState<Record<string, string>>({});
  const [customizationType, setCustomizationType] = useState<string>('');
  const [uploadingColor, setUploadingColor] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    imageUrl: '',
    category: '',
    stock: '',
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
      return;
    }

    if (id && typeof id === 'string') {
      fetchProduct(id);
    }
  }, [isAuthenticated, user, router, id]);

  const fetchProduct = async (productId: string) => {
    try {
      const product = await productService.getById(productId);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        salePrice: product.salePrice?.toString() || '',
        imageUrl: product.imageUrl,
        category: product.category,
        stock: product.stock.toString(),
      });
      setColors(product.colors || []);
      setSizes(product.sizes || []);
      setColorImages(product.colorImages || {});
      setCustomizationType(product.customizationType || '');
    } catch (error) {
      notificationService.error('Failed to load product');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleColorImageUpload = async (color: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingColor(color);
    try {
      const url = await imageService.uploadImage(file);
      setColorImages((prev) => ({ ...prev, [color]: url }));
      notificationService.success(`${color} image uploaded`);
    } catch {
      notificationService.error(`Failed to upload ${color} image`);
    } finally {
      setUploadingColor(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await imageService.uploadImage(file);
      setFormData({ ...formData, imageUrl });
      notificationService.success('Image uploaded successfully');
    } catch (error) {
      notificationService.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || typeof id !== 'string') return;

    // Validation
    if (!formData.name.trim()) {
      notificationService.error('Product name is required');
      return;
    }
    if (!formData.description.trim()) {
      notificationService.error('Product description is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      notificationService.error('Valid price is required');
      return;
    }
    if (!formData.category.trim()) {
      notificationService.error('Product category is required');
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      notificationService.error('Valid stock quantity is required');
      return;
    }
    if (formData.salePrice && parseFloat(formData.salePrice) >= parseFloat(formData.price)) {
      notificationService.error('Sale price must be less than regular price');
      return;
    }
    if (customizationType === 'wristband' && colors.length === 0) {
      notificationService.error('Wristband products need at least one band color');
      return;
    }

    setSaving(true);
    try {
      await productService.update(id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
        clearSalePrice: !formData.salePrice,
        imageUrl: formData.imageUrl || undefined,
        category: formData.category.trim(),
        stock: parseInt(formData.stock),
        colors: colors.length > 0 ? colors : [],
        sizes: sizes.length > 0 ? sizes : [],
        colorImages,
        customizationType: customizationType || '',
      });
      
      notificationService.success('Product updated successfully');
      router.push('/admin/products');
    } catch (error: any) {
      notificationService.error(
        error.response?.data?.message || 'Failed to update product'
      );
    } finally {
      setSaving(false);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-primary min-h-screen">
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/products')}
            className="text-button hover:text-button-200 mb-4 flex items-center gap-2 font-medium transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Products
          </button>
          <h1 className="text-4xl font-bold text-foreground">Edit Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-8 space-y-6 border-2 border-foreground/10">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Product Name <span className="text-gold-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 transition-all"
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Description <span className="text-gold-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 transition-all"
              placeholder="Enter product description"
              required
            />
          </div>

          {/* Price, Sale Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Regular Price ($) <span className="text-gold-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 transition-all"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Sale Price ($) <span className="text-foreground/50 text-xs">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                className="w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 transition-all"
                placeholder="0.00"
              />
              <p className="text-xs text-foreground/60 mt-1">Must be less than regular price</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Stock Quantity <span className="text-gold-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 transition-all"
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Category <span className="text-gold-400">*</span>
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 transition-all"
              placeholder="e.g., Electronics, Clothing, Home & Garden"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Product Image
            </label>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground transition-all file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-button file:text-button-text hover:file:bg-button-200"
                disabled={uploading}
              />
              {uploading && (
                <div className="flex items-center gap-2 text-button">
                  <LoadingSpinner />
                  <span>Uploading image...</span>
                </div>
              )}
              {formData.imageUrl && (
                <div className="mt-4">
                  <p className="text-sm text-foreground/70 mb-2 font-semibold">Current Image:</p>
                  <img
                    src={formData.imageUrl}
                    alt="Product preview"
                    className="w-48 h-48 object-cover rounded-xl border-2 border-foreground/20 shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Colors */}
          <ColorMultiSelect
            selected={colors}
            onChange={(next) => {
              setColors(next);
              setColorImages((prev) => {
                const pruned: Record<string, string> = {};
                for (const c of next) {
                  if (prev[c]) pruned[c] = prev[c];
                }
                return pruned;
              });
            }}
          />

          {/* Per-color images */}
          {colors.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Color images <span className="text-foreground/50 text-xs">(optional — shown when customer picks that color)</span>
              </label>
              <div className="space-y-3">
                {colors.map((color) => (
                  <div key={color} className="flex flex-wrap items-center gap-4 p-3 border border-foreground/20 rounded-xl bg-primary/40">
                    <span className="text-sm font-medium text-white w-24">{color}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleColorImageUpload(color, e)}
                      disabled={uploadingColor === color}
                      className="text-sm text-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-button file:text-button-text"
                    />
                    {uploadingColor === color && <LoadingSpinner />}
                    {colorImages[color] && (
                      <img src={colorImages[color]} alt={color} className="w-16 h-16 object-cover rounded-lg border border-foreground/20" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wristband customization */}
          <div className="flex items-center gap-3 p-4 border border-foreground/20 rounded-xl bg-primary/40">
            <input
              type="checkbox"
              id="wristbandCustomization"
              checked={customizationType === 'wristband'}
              onChange={(e) => setCustomizationType(e.target.checked ? 'wristband' : '')}
              className="h-4 w-4 rounded border-foreground/30 text-button focus:ring-button/50"
            />
            <label htmlFor="wristbandCustomization" className="text-sm font-semibold text-white">
              Wristband customization (number + writing color on storefront)
            </label>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Available Sizes (1-100) <span className="text-foreground/50 text-xs">(Optional)</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                min="1"
                max="100"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = parseInt(sizeInput);
                    if (val >= 1 && val <= 100 && !sizes.includes(val)) {
                      setSizes([...sizes, val].sort((a, b) => a - b));
                    }
                    setSizeInput('');
                  }
                }}
                className="flex-1 px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 transition-all"
                placeholder="Enter size (1-100) and press Enter"
              />
              <button
                type="button"
                onClick={() => {
                  const val = parseInt(sizeInput);
                  if (val >= 1 && val <= 100 && !sizes.includes(val)) {
                    setSizes([...sizes, val].sort((a, b) => a - b));
                  }
                  setSizeInput('');
                }}
                className="px-4 py-3 bg-button text-button-text rounded-xl hover:bg-button-200 font-semibold transition-all"
              >
                Add
              </button>
            </div>
            {sizes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-button/20 text-button border border-button/30 rounded-lg text-sm font-medium"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => setSizes(sizes.filter((s) => s !== size))}
                      className="ml-1 text-button hover:text-foreground transition-colors"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-foreground/10">
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="px-6 py-3 border border-foreground/20 rounded-xl text-foreground hover:bg-primary/60 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-3 bg-button text-button-text rounded-xl hover:bg-button-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
            >
              {saving ? (
                <>
                  <LoadingSpinner />
                  Saving...
                </>
              ) : (
                'Update Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}


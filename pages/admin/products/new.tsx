import { useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { productService } from '@/services/productService';
import { imageService } from '@/services/imageService';
import { notificationService } from '@/services/notificationService';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function NewProduct() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sizeInput, setSizeInput] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    imageUrl: '',
    category: '',
    stock: '',
  });

  // Redirect if not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

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
    
    if (formData.salePrice && parseFloat(formData.salePrice) >= parseFloat(formData.price)) {
      notificationService.error('Sale price must be less than regular price');
      return;
    }
    if (!formData.imageUrl) {
      notificationService.error('Product image is required');
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

    setLoading(true);
    try {
      await productService.create({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
        imageUrl: formData.imageUrl,
        category: formData.category.trim(),
        stock: parseInt(formData.stock),
        colors: colors.length > 0 ? colors : undefined,
        sizes: sizes.length > 0 ? sizes : undefined,
      });
      
      notificationService.success('Product created successfully');
      router.push('/admin/products');
    } catch (error: any) {
      notificationService.error(
        error.response?.data?.message || 'Failed to create product'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-primary min-h-screen">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
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
          <h1 className="text-4xl font-bold text-foreground">Create New Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-8 space-y-6 border-2 border-foreground/10">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
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
            <label className="block text-sm font-semibold text-foreground mb-2">
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
              <label className="block text-sm font-semibold text-foreground mb-2">
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
              <label className="block text-sm font-semibold text-foreground mb-2">
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
              <label className="block text-sm font-semibold text-foreground mb-2">
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
            <label className="block text-sm font-semibold text-foreground mb-2">
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
            <label className="block text-sm font-semibold text-foreground mb-2">
              Product Image <span className="text-gold-400">*</span>
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
                  <p className="text-sm text-foreground/70 mb-2 font-semibold">Preview:</p>
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
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Available Colors <span className="text-foreground/50 text-xs">(Optional — click to toggle)</span>
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-3 p-3 border border-foreground/20 rounded-xl bg-primary/40">
              {[
                { name: 'Red', hex: '#EF4444' }, { name: 'Blue', hex: '#3B82F6' }, { name: 'Green', hex: '#22C55E' },
                { name: 'Yellow', hex: '#EAB308' }, { name: 'Orange', hex: '#F97316' }, { name: 'Purple', hex: '#A855F7' },
                { name: 'Pink', hex: '#EC4899' }, { name: 'Black', hex: '#1F2937' }, { name: 'White', hex: '#F9FAFB' },
                { name: 'Gray', hex: '#6B7280' }, { name: 'Brown', hex: '#92400E' }, { name: 'Navy', hex: '#1E3A5F' },
                { name: 'Teal', hex: '#14B8A6' }, { name: 'Cyan', hex: '#06B6D4' }, { name: 'Magenta', hex: '#D946EF' },
                { name: 'Lime', hex: '#84CC16' }, { name: 'Indigo', hex: '#6366F1' }, { name: 'Gold', hex: '#D4A017' },
                { name: 'Silver', hex: '#C0C0C0' }, { name: 'Beige', hex: '#F5F5DC' }, { name: 'Maroon', hex: '#800000' },
                { name: 'Olive', hex: '#808000' }, { name: 'Coral', hex: '#FF7F50' }, { name: 'Salmon', hex: '#FA8072' },
                { name: 'Cream', hex: '#FFFDD0' }, { name: 'Turquoise', hex: '#40E0D0' }, { name: 'Lavender', hex: '#E6E6FA' },
                { name: 'Burgundy', hex: '#800020' }, { name: 'Charcoal', hex: '#36454F' }, { name: 'Peach', hex: '#FFCBA4' },
                { name: 'Rust', hex: '#B7410E' }, { name: 'Mint', hex: '#98FF98' }, { name: 'Tan', hex: '#D2B48C' },
                { name: 'Rose', hex: '#FF007F' }, { name: 'Sky', hex: '#87CEEB' }, { name: 'Wine', hex: '#722F37' },
                { name: 'Ivory', hex: '#FFFFF0' }, { name: 'Plum', hex: '#DDA0DD' }, { name: 'Khaki', hex: '#C3B091' },
                { name: 'Chocolate', hex: '#7B3F00' },
              ].map(({ name, hex }) => {
                const isSelected = colors.includes(name);
                const isLight = ['White', 'Ivory', 'Cream', 'Beige', 'Yellow', 'Lime', 'Gold', 'Silver', 'Lavender', 'Peach', 'Mint', 'Khaki'].includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    onClick={() => isSelected ? setColors(colors.filter((c) => c !== name)) : setColors([...colors, name])}
                    className={`w-9 h-9 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                      isSelected
                        ? 'border-button ring-2 ring-button/40 ring-offset-1 ring-offset-primary scale-110 shadow-lg'
                        : 'border-foreground/20 hover:border-foreground/50 hover:scale-105'
                    }`}
                    style={{ backgroundColor: hex }}
                  >
                    {isSelected && (
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" style={{ color: isLight ? '#1F2937' : '#FFFFFF' }}>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
            {colors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <span
                    key={color}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-button/20 text-button border border-button/30 rounded-lg text-sm font-medium"
                  >
                    {color}
                    <button
                      type="button"
                      onClick={() => setColors(colors.filter((c) => c !== color))}
                      className="ml-1 text-button hover:text-foreground transition-colors"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
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
              onClick={() => router.back()}
              className="px-6 py-3 border border-foreground/20 rounded-xl text-foreground hover:bg-primary/60 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-3 bg-button text-button-text rounded-xl hover:bg-button-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  Creating...
                </>
              ) : (
                'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}


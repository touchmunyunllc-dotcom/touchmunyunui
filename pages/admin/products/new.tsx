import { useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { productService } from '@/services/productService';
import { notificationService } from '@/services/notificationService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ProductVariantConfig } from '@/components/admin/ProductVariantConfig';
import { ProductStorefrontFlags } from '@/components/admin/ProductStorefrontFlags';
import { ProductGalleryUpload } from '@/components/admin/ProductGalleryUpload';
import { useProductVariantConfig } from '@/hooks/useProductVariantConfig';
import { normalizeProductGalleryImages, primaryProductImage } from '@/lib/productMedia';

type ProductFormTab = 'basic' | 'pricing' | 'media' | 'storefront' | 'variants';

const PRODUCT_FORM_TABS: { id: ProductFormTab; label: string }[] = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'pricing', label: 'Pricing & Stock' },
  { id: 'media', label: 'Media' },
  { id: 'storefront', label: 'Storefront' },
  { id: 'variants', label: 'Variants' },
];

const inputClassName =
  'w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 transition-all';

export default function NewProduct() {
  const router = useRouter();
  const productsListHref = '/admin/products';
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<ProductFormTab>('basic');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const variant = useProductVariantConfig();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    category: '',
    stock: '',
    isNewArrival: false,
    isBestSeller: false,
    isFeatured: false,
    isActive: true,
  });

  if (!isAuthenticated || user?.role !== 'admin') {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    if (galleryImages.length === 0) {
      notificationService.error('At least one product image is required');
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

    const variantError = variant.validate();
    if (variantError) {
      notificationService.error(variantError);
      return;
    }

    setLoading(true);
    try {
      await productService.create({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
        imageUrl: primaryProductImage(galleryImages),
        images: galleryImages,
        category: formData.category.trim(),
        stock: parseInt(formData.stock),
        isNewArrival: formData.isNewArrival,
        isBestSeller: formData.isBestSeller,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        ...variant.toApiPayload('create'),
      });

      notificationService.success('Product created successfully');
      router.push(productsListHref);
    } catch (error: any) {
      notificationService.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const currentTabIndex = PRODUCT_FORM_TABS.findIndex((tab) => tab.id === activeTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === PRODUCT_FORM_TABS.length - 1;

  const goToPreviousTab = () => {
    if (!isFirstTab) setActiveTab(PRODUCT_FORM_TABS[currentTabIndex - 1].id);
  };

  const goToNextTab = () => {
    if (!isLastTab) setActiveTab(PRODUCT_FORM_TABS[currentTabIndex + 1].id);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-primary min-h-screen">
        <div className="mb-8">
          <button
            onClick={() => router.push(productsListHref)}
            className="text-button hover:text-button-200 mb-4 flex items-center gap-2 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </button>
          <h1 className="text-4xl font-bold text-foreground">Create New Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-8 border-2 border-foreground/10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">{PRODUCT_FORM_TABS[currentTabIndex].label}</h2>
            <p className="text-sm text-foreground/60 mt-1">
              Step {currentTabIndex + 1} of {PRODUCT_FORM_TABS.length}
            </p>
          </div>

          <div className="space-y-6 min-h-[320px]">
            {activeTab === 'basic' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Product Name <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputClassName}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Description <span className="text-gold-400">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className={inputClassName}
                    placeholder="Enter product description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Category <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={inputClassName}
                    placeholder="e.g., Apparel, Accessories"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="mr-2 w-4 h-4 rounded border-foreground/30 text-button focus:ring-button/50"
                    />
                    <span className="text-sm font-semibold text-white">Active on storefront</span>
                  </label>
                  <p className="text-xs text-foreground/50 mt-1 ml-6">
                    Uncheck to hide this product from customers without deleting it.
                  </p>
                </div>
              </>
            )}

            {activeTab === 'pricing' && (
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
                    className={inputClassName}
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
                    className={inputClassName}
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
                    className={inputClassName}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <ProductGalleryUpload
                images={galleryImages}
                onChange={setGalleryImages}
                uploading={uploading}
                onUploadingChange={setUploading}
              />
            )}

            {activeTab === 'storefront' && (
              <ProductStorefrontFlags
                isNewArrival={formData.isNewArrival}
                isBestSeller={formData.isBestSeller}
                isFeatured={formData.isFeatured}
                onChange={(field, value) => setFormData({ ...formData, [field]: value })}
              />
            )}

            {activeTab === 'variants' && (
              <ProductVariantConfig
                checkboxId="wristbandCustomizationNew"
                colors={variant.state.colors}
                onColorsChange={variant.setColors}
                colorImages={variant.state.colorImages}
                onColorImageUpload={variant.handleColorImageUpload}
                uploadingColor={variant.uploadingColor}
                customizationType={variant.state.customizationType}
                onCustomizationTypeChange={variant.setCustomizationType}
                colorSurcharge={variant.state.colorSurcharge}
                onColorSurchargeChange={variant.setColorSurcharge}
                noSurchargeColors={variant.state.noSurchargeColors}
                onNoSurchargeColorToggle={variant.toggleNoSurchargeColor}
                customizationPolicy={variant.state.customizationPolicy}
                onCustomizationPolicyChange={variant.setCustomizationPolicy}
                imageObjectPosition={variant.state.imageObjectPosition}
                onImageObjectPositionChange={variant.setImageObjectPosition}
                sizes={variant.state.sizes}
                sizeInput={variant.sizeInput}
                onSizeInputChange={variant.setSizeInput}
                onAddSize={variant.addSize}
                onRemoveSize={variant.removeSize}
              />
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 mt-8 border-t border-foreground/10">
            <button
              type="button"
              onClick={() => router.push(productsListHref)}
              className="px-6 py-3 border border-foreground/20 rounded-xl text-foreground hover:bg-primary/60 transition-all font-medium"
            >
              Cancel
            </button>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={goToPreviousTab}
                disabled={isFirstTab}
                className="px-5 py-3 border border-foreground/20 rounded-xl text-foreground hover:bg-primary/60 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={goToNextTab}
                disabled={isLastTab}
                className="px-5 py-3 border border-foreground/20 rounded-xl text-foreground hover:bg-primary/60 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
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
          </div>
        </form>
      </div>
    </Layout>
  );
}

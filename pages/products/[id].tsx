import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ProductDetailSkeleton } from '@/components/skeletons/ProductDetailSkeleton';
import { RelatedProducts } from '@/components/RelatedProducts';
import { SEO } from '@/components/SEO';
import { StructuredData } from '@/components/StructuredData';
import { ProductCardGallery } from '@/components/ProductCardGallery';
import { WristbandStorefrontFields } from '@/components/WristbandStorefrontFields';
import { StorefrontColorSelect } from '@/components/StorefrontColorSelect';
import { ProductAudienceBadge } from '@/components/ProductAudienceBadge';
import { productService, Product } from '@/services/productService';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notificationService';
import { useProductCustomization } from '@/hooks/useProductCustomization';
import { productHref, productsListHref } from '@/lib/productRoutes';
import { ADMIN_SHOPPING_BLOCKED_MESSAGE, isAdminUser } from '@/lib/adminShopping';
import {
  colorNameToHex,
  getCartLineOptions,
  isWristbandProduct,
} from '@/services/productCustomizationService';

export default function ProductView() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [updatingQuantity, setUpdatingQuantity] = useState(false);
  const { addItem, items, updateQuantity, ensureGuestCartLoaded } = useCart();
  const { isAuthenticated, user } = useAuth();
  const adminShoppingBlocked = isAuthenticated && isAdminUser(user);

  const {
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    customNumber,
    setCustomNumber,
    writingColor,
    setWritingColor,
    isWristband,
    matchingCartItem,
    displayUnitPrice,
    colorSurchargeAmount,
    displayImage,
    validateSelection,
    toCartPayload,
  } = useProductCustomization(product, items);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const data = await productService.getById(id as string);
          setProduct(data);
        } catch {
          notificationService.error('Failed to load product');
          router.push(productsListHref);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, router]);

  useEffect(() => {
    setQuantity(matchingCartItem?.quantity ?? 1);
  }, [matchingCartItem]);

  const MAX_QUANTITY = 10;

  const handleQuantityChange = async (newQuantity: number) => {
    if (!product) return;

    const maxAllowed = Math.min(product.stock, MAX_QUANTITY);
    const validQuantity = Math.max(1, Math.min(newQuantity, maxAllowed));

    if (newQuantity > MAX_QUANTITY) {
      notificationService.error(`Maximum quantity allowed per product is ${MAX_QUANTITY}`);
      setQuantity(MAX_QUANTITY);
      return;
    }

    setQuantity(validQuantity);

    if (matchingCartItem) {
      setUpdatingQuantity(true);
      try {
        await updateQuantity(product.id, validQuantity, getCartLineOptions(matchingCartItem));
      } catch {
        setQuantity(matchingCartItem.quantity);
      } finally {
        setUpdatingQuantity(false);
      }
    }
  };

  const handleIncrement = () => {
    const maxAllowed = Math.min(product?.stock || 0, MAX_QUANTITY);
    if (product && quantity < maxAllowed) {
      handleQuantityChange(quantity + 1);
    } else if (quantity >= MAX_QUANTITY) {
      notificationService.error(`Maximum quantity allowed per product is ${MAX_QUANTITY}`);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      handleQuantityChange(quantity - 1);
    }
  };

  const ensureValidSelection = () => {
    if (adminShoppingBlocked) {
      notificationService.error(ADMIN_SHOPPING_BLOCKED_MESSAGE);
      return false;
    }
    const message = validateSelection();
    if (message) {
      notificationService.error(message);
      return false;
    }
    if (product && product.stock <= 0) {
      notificationService.error('This product is out of stock');
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!product || !ensureValidSelection()) return;
    if (addingToCart || buyingNow) return;

    setAddingToCart(true);
    try {
      await addItem(toCartPayload(quantity), { merge: 'add' });
    } catch {
      // Error already handled in CartContext
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || !ensureValidSelection()) return;
    if (addingToCart || buyingNow) return;

    setBuyingNow(true);
    try {
      await addItem(toCartPayload(quantity), { merge: 'set' });
      ensureGuestCartLoaded();
      router.push(isAuthenticated ? '/checkout' : '/guest-checkout');
    } catch {
      // Error already notified in CartContext
    } finally {
      setBuyingNow(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <section className="bg-black min-h-screen">
          <ProductDetailSkeleton />
        </section>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Product not found</h1>
            <Link
              href={productsListHref}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://touchmunyun.com';
  const productUrl = `${siteUrl}${productHref(product.id)}`;
  const previewInk = colorNameToHex(writingColor);
  const hasColors = (product.colors?.length ?? 0) > 0;
  const hasSizes = (product.sizes?.length ?? 0) > 0;

  return (
    <>
      <SEO
        title={`${product.name} - Touch Munyun | Performance Accessories & Apparel`}
        description={
          product.description ||
          `View ${product.name} at Touch Munyun. Performance accessories and apparel for athletes and grinders.`
        }
        keywords={`${product.name}, ${product.category}, Touch Munyun, sports accessories, performance apparel`}
        image={displayImage}
        type="product"
        canonical={productUrl}
      />
      <StructuredData
        type="Product"
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: displayImage,
          brand: { '@type': 'Brand', name: 'Touch Munyun' },
          category: product.category,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: product.price.toString(),
            availability:
              product.stock > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            url: productUrl,
            seller: { '@type': 'Organization', name: 'Touch Munyun' },
          },
        }}
      />
      <StructuredData
        type="BreadcrumbList"
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Products',
              item: `${siteUrl}${productsListHref}`,
            },
            { '@type': 'ListItem', position: 3, name: product.name, item: productUrl },
          ],
        }}
      />
      <Layout>
        <section className="bg-black min-h-screen pb-12 overflow-x-hidden">
          <div className="page-shell py-6 sm:py-8">
            <nav className="mb-6 flex items-center gap-2 text-sm text-white/50">
              <Link href={productsListHref} className="hover:text-red-400 transition-colors">
                Products
              </Link>
              <span>/</span>
              <span className="text-white/80 truncate">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 [&>*]:min-w-0">
              <div className="group relative min-w-0">
                <ProductCardGallery
                  product={product}
                  variant="detail"
                  activeImageUrl={displayImage}
                />
                {isWristband && customNumber.trim() && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span
                      className="text-5xl sm:text-6xl font-black tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]"
                      style={{ color: previewInk }}
                    >
                      {customNumber.trim()}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-6 min-w-0">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 break-words">{product.name}</h1>
                  <div className="mb-4">
                    {product.salePrice && !isWristband ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-2xl font-semibold text-red-500">
                          ${displayUnitPrice.toFixed(2)}
                        </span>
                        <span className="text-lg text-white/50 line-through">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="px-2 py-0.5 bg-red-600/20 text-red-400 border border-red-600/30 rounded-md text-sm font-semibold">
                          {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                        </span>
                        {colorSurchargeAmount > 0 && (
                          <p className="w-full text-sm text-white/60">
                            Includes ${colorSurchargeAmount.toFixed(2)} color fee
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span className="text-2xl font-semibold text-red-500">
                          ${displayUnitPrice.toFixed(2)}
                        </span>
                        {colorSurchargeAmount > 0 && (
                          <p className="text-sm text-white/60 mt-1">
                            Includes ${colorSurchargeAmount.toFixed(2)} color
                            {isWristband ? ' band' : ''} fee
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 bg-white/10 border border-white/15 text-white rounded-full text-sm font-medium">
                      {product.category}
                    </span>
                    <ProductAudienceBadge product={product} />
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.stock > 0
                          ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                          : 'bg-white/5 text-white/50 border border-white/10'
                      }`}
                    >
                      {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white mb-2">Description</h2>
                  <p className="text-white/70 leading-relaxed">{product.description}</p>
                </div>

                {hasColors && !isWristband && (
                  <div className="space-y-2">
                    <StorefrontColorSelect
                      colors={product.colors}
                      value={selectedColor}
                      onChange={setSelectedColor}
                      hint={
                        product.colorImages && Object.keys(product.colorImages).length > 0
                          ? 'Photo updates to match your color choice.'
                          : 'Choose from available colors.'
                      }
                    />
                    {(product.colorSurcharge ?? 0) > 0 && (
                      <p className="text-sm text-white/60 leading-relaxed">
                        {product.noSurchargeColors?.length
                          ? `${product.noSurchargeColors.join(' and ')} included at base price. `
                          : ''}
                        Other colors add ${product.colorSurcharge!.toFixed(2)}
                        {colorSurchargeAmount > 0
                          ? ` ($${colorSurchargeAmount.toFixed(2)} reflected in price above).`
                          : '.'}
                      </p>
                    )}
                  </div>
                )}

                {isWristband && (
                  <WristbandStorefrontFields
                    product={product}
                    selectedColor={selectedColor}
                    onSelectedColorChange={setSelectedColor}
                    customNumber={customNumber}
                    onCustomNumberChange={setCustomNumber}
                    writingColor={writingColor}
                    onWritingColorChange={setWritingColor}
                    colorSurchargeAmount={colorSurchargeAmount}
                  />
                )}

                {hasSizes && !isWristbandProduct(product) && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-3">Size</h2>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                            selectedSize === size
                              ? 'bg-red-600/20 border-red-500 text-red-400'
                              : 'bg-white/5 border-white/15 text-white/80 hover:border-white/30'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <label className="text-sm font-medium text-white">
                      {matchingCartItem ? 'Quantity in cart' : 'Quantity'}
                    </label>
                    <div className="flex items-center border border-white/15 rounded-lg bg-black/40 w-fit">
                      <button
                        type="button"
                        onClick={handleDecrement}
                        disabled={quantity <= 1 || updatingQuantity || product.stock === 0}
                        className="px-4 py-2.5 text-white/70 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-manipulation"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="px-5 py-2.5 border-x border-white/15 min-w-[3rem] text-center text-white tabular-nums">
                        {updatingQuantity ? '…' : quantity}
                      </span>
                      <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={
                          quantity >= Math.min(product.stock, MAX_QUANTITY) ||
                          updatingQuantity ||
                          product.stock === 0
                        }
                        className="px-4 py-2.5 text-white/70 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-manipulation"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {matchingCartItem && (
                    <p className="text-sm text-green-400/90 text-center">
                      ✓ Already in your cart ({matchingCartItem.quantity}{' '}
                      {matchingCartItem.quantity === 1 ? 'item' : 'items'})
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={
                        product.stock === 0 ||
                        addingToCart ||
                        buyingNow ||
                        adminShoppingBlocked
                      }
                      className={`flex-1 py-3.5 sm:py-4 rounded-xl font-semibold text-base transition-all touch-manipulation ${
                        product.stock > 0 && !addingToCart && !buyingNow && !adminShoppingBlocked
                          ? 'bg-white/10 border-2 border-red-600/60 text-white hover:bg-white/15 hover:border-red-500'
                          : 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10'
                      }`}
                    >
                      {addingToCart ? 'Adding…' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      disabled={
                        product.stock === 0 ||
                        addingToCart ||
                        buyingNow ||
                        adminShoppingBlocked
                      }
                      className={`flex-1 py-3.5 sm:py-4 rounded-xl font-semibold text-base transition-all touch-manipulation ${
                        product.stock > 0 && !addingToCart && !buyingNow && !adminShoppingBlocked
                          ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/30'
                          : 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10'
                      }`}
                    >
                      {buyingNow ? 'Processing…' : product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
                    </button>
                  </div>

                  {matchingCartItem && (
                    <Link
                      href="/cart"
                      className="block w-full text-center py-3 rounded-xl font-semibold text-sm border border-white/15 text-white/80 hover:text-red-400 hover:border-red-500/40 transition-colors"
                    >
                      View cart →
                    </Link>
                  )}
                </div>

                <Link
                  href={productsListHref}
                  className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to all products
                </Link>
              </div>
            </div>

            <RelatedProducts productId={product.id} category={product.category} />
          </div>
        </section>
      </Layout>
    </>
  );
}

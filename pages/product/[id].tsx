import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SEO } from '@/components/SEO';
import { StructuredData } from '@/components/StructuredData';
import { productService, Product } from '@/services/productService';
import { useCart } from '@/context/CartContext';
import { notificationService } from '@/services/notificationService';
import Image from 'next/image';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<number | undefined>(undefined);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [updatingQuantity, setUpdatingQuantity] = useState(false);
  const { addItem, items, updateQuantity } = useCart();

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const data = await productService.getById(id as string);
          setProduct(data);
        } catch (error) {
          notificationService.error('Failed to load product');
          router.push('/');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, router]);

  // Check if product is already in cart and sync quantity
  useEffect(() => {
    if (product) {
      const cartItem = items.find(
        (item) => item.productId === product.id && item.selectedColor === selectedColor && item.selectedSize === selectedSize
      );
      if (cartItem) {
        setQuantity(cartItem.quantity);
      } else {
        setQuantity(1);
      }
    }
  }, [product, items, selectedColor, selectedSize]);

  // Auto-select first color/size when product loads
  useEffect(() => {
    if (product) {
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      }
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
    }
  }, [product]);

  const handleQuantityChange = async (newQuantity: number) => {
    if (!product) return;
    
    const MAX_QUANTITY = 10;
    // Ensure quantity is within valid range (1 to min of stock or max 10)
    const maxAllowed = Math.min(product.stock, MAX_QUANTITY);
    const validQuantity = Math.max(1, Math.min(newQuantity, maxAllowed));
    
    if (newQuantity > MAX_QUANTITY) {
      notificationService.error(`Maximum quantity allowed per product is ${MAX_QUANTITY}`);
      setQuantity(MAX_QUANTITY);
      return;
    }
    
    setQuantity(validQuantity);

    const cartItem = items.find(
      (item) => item.productId === product.id && item.selectedColor === selectedColor && item.selectedSize === selectedSize
    );
    if (cartItem) {
      // Item is in cart, update the quantity
      setUpdatingQuantity(true);
      try {
        await updateQuantity(product.id, validQuantity, {
          selectedColor,
          selectedSize,
        });
        notificationService.success('Cart quantity updated');
      } catch (error) {
        // Error already handled in CartContext
        // Revert to original quantity on error
        setQuantity(cartItem.quantity);
      } finally {
        setUpdatingQuantity(false);
      }
    }
  };

  const handleIncrement = () => {
    const MAX_QUANTITY = 10;
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

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      await addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.imageUrl,
        selectedColor,
        selectedSize,
      });
      notificationService.success(`${product.name} added to cart!`);
    } catch (error) {
      // Error already handled in CartContext
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    setBuyingNow(true);
    try {
      // Add item to cart first
      await addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.imageUrl,
        selectedColor,
        selectedSize,
      });
      // Redirect to checkout
      router.push('/checkout');
    } catch (error) {
      // Error already handled in CartContext
      setBuyingNow(false);
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

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Product not found</h1>
            <button
              onClick={() => router.push('/')}
              className="bg-button text-button-text px-6 py-2 rounded-lg hover:bg-button-200 transition-all font-semibold"
            >
              Back to Products
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://touchmunyun.com';
  const productImage = product.imageUrl || `${siteUrl}/placeholder.png`;
  const productUrl = `${siteUrl}/product/${product.id}`;

  return (
    <>
      <SEO
        title={`${product.name} - TouchMunyun | Premium Handcrafted Fashion`}
        description={product.description || `Shop ${product.name} at TouchMunyun. Premium handcrafted fashion for bold, modern sportswear.`}
        keywords={`${product.name}, ${product.category}, handcrafted fashion, sportswear, TouchMunyun, premium clothing`}
        image={productImage}
        type="product"
      />
      <StructuredData
        type="Product"
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: productImage,
          brand: {
            '@type': 'Brand',
            name: 'TouchMunyun',
          },
          category: product.category,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: product.price.toString(),
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: productUrl,
            seller: {
              '@type': 'Organization',
              name: 'TouchMunyun',
            },
          },
        }}
      />
      <StructuredData
        type="BreadcrumbList"
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: siteUrl,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Products',
              item: `${siteUrl}/products`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: product.name,
              item: productUrl,
            },
          ],
        }}
      />
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => router.back()}
          className="mb-8 text-foreground/70 hover:text-button flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-primary/60">
            <Image
              src={product.imageUrl || '/placeholder.png'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">{product.name}</h1>
              <div className="mb-4">
                {product.salePrice ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-semibold text-button">${product.salePrice.toFixed(2)}</span>
                    <span className="text-lg text-foreground/50 line-through">${product.price.toFixed(2)}</span>
                    <span className="px-2 py-0.5 bg-button/20 text-button border border-button/30 rounded-md text-sm font-semibold">
                      {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-semibold text-button">${product.price.toFixed(2)}</span>
                )}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 bg-primary/40 backdrop-blur-sm border border-foreground/30 text-foreground rounded-full text-sm font-medium">
                  {product.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 0
                    ? 'bg-gold-500/20 text-gold-500 border border-gold-500/30'
                    : 'bg-primary/20 text-foreground/60 border border-foreground/20'
                }`}>
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Description</h2>
              <p className="text-foreground/70 leading-relaxed">{product.description}</p>
            </div>

            {/* Color Selector - Visual Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  Color{selectedColor ? ': ' : ''}
                  {selectedColor && <span className="text-button font-normal">{selectedColor}</span>}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => {
                    const colorMap: Record<string, string> = {
                      red: '#EF4444', blue: '#3B82F6', green: '#22C55E', yellow: '#EAB308',
                      orange: '#F97316', purple: '#A855F7', pink: '#EC4899', black: '#1F2937',
                      white: '#F9FAFB', gray: '#6B7280', grey: '#6B7280', brown: '#92400E',
                      navy: '#1E3A5F', teal: '#14B8A6', cyan: '#06B6D4', magenta: '#D946EF',
                      lime: '#84CC16', indigo: '#6366F1', violet: '#8B5CF6', gold: '#D4A017',
                      silver: '#C0C0C0', beige: '#F5F5DC', maroon: '#800000', olive: '#808000',
                      coral: '#FF7F50', salmon: '#FA8072', khaki: '#C3B091', cream: '#FFFDD0',
                      turquoise: '#40E0D0', lavender: '#E6E6FA', burgundy: '#800020',
                      charcoal: '#36454F', ivory: '#FFFFF0', peach: '#FFCBA4', rust: '#B7410E',
                      mint: '#98FF98', tan: '#D2B48C', plum: '#DDA0DD', rose: '#FF007F',
                      sky: '#87CEEB', sand: '#C2B280', wine: '#722F37', chocolate: '#7B3F00',
                    };
                    const bgColor = colorMap[color.toLowerCase()] || color;
                    const isValidCss = bgColor.startsWith('#') || bgColor.startsWith('rgb');

                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        className={`relative w-10 h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                          selectedColor === color
                            ? 'border-button ring-2 ring-button/40 ring-offset-2 ring-offset-primary scale-110 shadow-lg'
                            : 'border-foreground/30 hover:border-foreground/60 hover:scale-105'
                        }`}
                        style={isValidCss ? { backgroundColor: bgColor } : undefined}
                      >
                        {!isValidCss && (
                          <span className="text-[10px] font-bold text-foreground leading-tight text-center px-0.5">
                            {color.slice(0, 3)}
                          </span>
                        )}
                        {selectedColor === color && (
                          <svg className="w-5 h-5 absolute" viewBox="0 0 20 20" fill="currentColor"
                            style={{ color: ['white', 'ivory', 'cream', 'beige', 'yellow', 'lime', 'gold', 'silver', 'lavender', 'peach', 'mint', 'khaki', 'sand'].includes(color.toLowerCase()) ? '#1F2937' : '#FFFFFF' }}
                          >
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector - Dropdown */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Size</h2>
                <select
                  value={selectedSize ?? ''}
                  onChange={(e) => setSelectedSize(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full max-w-xs px-4 py-3 border border-foreground/20 rounded-xl bg-primary/60 backdrop-blur-sm text-foreground focus:ring-2 focus:ring-button/50 focus:border-button/50 transition-all appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                  <option value="" disabled>Select a size</option>
                  {product.sizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <label className="text-foreground font-medium">
                {items.find((item) => item.productId === product.id && item.selectedColor === selectedColor && item.selectedSize === selectedSize) ? 'Quantity in Cart:' : 'Quantity:'}
              </label>
              <div className="flex items-center border border-foreground/20 rounded-lg bg-primary/60">
                <button
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || updatingQuantity}
                  className="px-4 py-2 text-foreground/70 hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  -
                </button>
                <span className="px-6 py-2 border-x border-foreground/20 min-w-[3rem] text-center text-foreground">
                  {updatingQuantity ? '...' : quantity}
                </span>
                    <button
                      onClick={handleIncrement}
                      disabled={quantity >= Math.min(product.stock, 10) || updatingQuantity}
                      className="px-4 py-2 text-foreground/70 hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      +
                    </button>
              </div>
            </div>

            {/* Action Buttons */}
            {(() => {
              const cartItem = items.find(
                (item) => item.productId === product.id && item.selectedColor === selectedColor && item.selectedSize === selectedSize
              );
              const isInCart = cartItem !== undefined;

              if (isInCart) {
                // Show "Go to Cart" button when item is already in cart
                return (
                  <div className="space-y-4">
                    <div className="bg-gold-500/20 border-2 border-gold-500/30 rounded-lg p-4">
                      <p className="text-gold-500 font-medium text-center">
                        ✓ This item is already in your cart ({cartItem.quantity} {cartItem.quantity === 1 ? 'item' : 'items'})
                      </p>
                    </div>
                    <button
                      onClick={() => router.push('/cart')}
                      className="w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 bg-button text-button-text hover:bg-button-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Go to Cart
                    </button>
                  </div>
                );
              }

              // Show "Add to Cart" and "Buy Now" buttons when item is not in cart
              return (
                <div className="flex gap-4">
                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || addingToCart || buyingNow}
                    className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                      product.stock > 0 && !addingToCart && !buyingNow
                        ? 'bg-primary/60 backdrop-blur-sm border-2 border-button text-foreground hover:bg-primary/80 shadow-md hover:shadow-lg transform hover:scale-105'
                        : 'bg-primary/20 text-foreground/50 cursor-not-allowed'
                    }`}
                  >
                    {addingToCart ? 'Adding...' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>

                  {/* Buy Now Button */}
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0 || addingToCart || buyingNow}
                    className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                      product.stock > 0 && !addingToCart && !buyingNow
                        ? 'bg-button text-button-text hover:bg-button-200 shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-primary/20 text-foreground/50 cursor-not-allowed'
                    }`}
                  >
                    {buyingNow ? 'Processing...' : product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
      </Layout>
    </>
  );
}


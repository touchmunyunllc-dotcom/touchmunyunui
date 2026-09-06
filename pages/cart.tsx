import { useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { SEO } from '@/components/SEO';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notificationService';
import { EmptyState } from '@/components/EmptyState';
import { CartLineCustomizationTags } from '@/components/CartLineCustomizationTags';
import { getCartLineOptions, dedupeGuestCartLines } from '@/services/productCustomizationService';
import { CustomizationPolicyNotice } from '@/components/CustomizationPolicyNotice';
import { CouponSlider } from '@/components/CouponSlider';
import { ProductImage } from '@/components/ProductImage';
import { IMAGE_SIZES } from '@/lib/imageSizes';
import { ADMIN_SHOPPING_BLOCKED_MESSAGE, isAdminUser } from '@/lib/adminShopping';
import Link from 'next/link';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, tax, discount, total, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const adminShoppingBlocked = isAuthenticated && isAdminUser(user);
  const cartLines = useMemo(() => dedupeGuestCartLines(items), [items]);
  const lineCount = cartLines.length;

  const handleCheckout = () => {
    if (adminShoppingBlocked) {
      notificationService.error(ADMIN_SHOPPING_BLOCKED_MESSAGE);
      return;
    }
    if (cartLines.length === 0) {
      notificationService.error('Cart is empty');
      return;
    }

    if (!isAuthenticated) {
      router.push('/guest-checkout');
      return;
    }

    router.push('/checkout');
  };

  if (cartLines.length === 0) {
    return (
      <>
      <SEO title="Shopping Cart - Touch Munyun" noindex nofollow />
      <Layout>
        <div className="min-h-screen bg-primary py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <EmptyState
              variant="cart"
              title="Your cart is empty"
              description="Looks like you haven't added anything to your cart yet. Start shopping to fill it up!"
              action={{
                label: 'Start Shopping',
                onClick: () => router.push('/'),
              }}
            />
          </div>
        </div>
      </Layout>
      </>
    );
  }

  return (
    <>
      <SEO title="Shopping Cart - Touch Munyun" noindex nofollow />
      <Layout>
        <div className="min-h-screen bg-primary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-foreground mb-2">Shopping Cart</h1>
            <p className="text-xl text-foreground/80">
              {lineCount} {lineCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-primary/80 rounded-2xl shadow-lg p-6 border border-foreground/20">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Cart Items</h2>
                  <button
                    onClick={clearCart}
                    className="text-sm text-foreground/70 hover:text-foreground font-medium transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
                <div className="space-y-4">
                  {cartLines.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 sm:gap-4 p-4 rounded-xl border border-foreground/20 hover:border-button hover:shadow-md transition-all duration-200 bg-primary/60 min-w-0 overflow-hidden"
                    >
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-foreground/10">
                        <ProductImage
                          src={item.image}
                          alt={item.name}
                          sizes={IMAGE_SIZES.cartThumb}
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 break-words">
                          {item.name}
                        </h3>
                        <CartLineCustomizationTags line={item} />
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-2">
                          <p className="text-foreground/70 text-sm sm:text-base">
                            ${item.price.toFixed(2)} each
                          </p>
                          <p className="text-lg sm:text-2xl font-bold text-button tabular-nums shrink-0">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center border border-foreground/20 rounded-lg shrink-0">
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity - 1, getCartLineOptions(item))
                              }
                              className="px-3 py-1 hover:bg-primary transition-colors rounded-l-lg text-foreground"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 12H4"
                                />
                              </svg>
                            </button>
                            <span className="px-4 py-1 font-semibold min-w-[3rem] text-center text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => {
                                const MAX_QUANTITY = 10;
                                if (item.quantity >= MAX_QUANTITY) {
                                  notificationService.error(`Maximum quantity allowed per product is ${MAX_QUANTITY}`);
                                } else {
                                  updateQuantity(item.productId, item.quantity + 1, getCartLineOptions(item));
                                }
                              }}
                              disabled={item.quantity >= 10}
                              className="px-3 py-1 hover:bg-primary transition-colors rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId, getCartLineOptions(item))}
                            className="text-foreground/70 hover:text-foreground font-medium text-sm transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-primary/80 rounded-2xl shadow-xl p-6 sticky top-24 border border-foreground/20">
                <h2 className="text-2xl font-bold text-foreground mb-6">Order Summary</h2>
                <CouponSlider variant="compact" />
                <div className="space-y-4 mb-6 mt-4">
                  <div className="flex justify-between text-foreground/70">
                    <span>Subtotal</span>
                    <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-foreground/70">
                    <span>Shipping</span>
                    <span className="font-semibold text-gold-500">Free</span>
                  </div>
                  <div className="flex justify-between text-foreground/70">
                    <span>Tax</span>
                    <span className="font-semibold text-foreground">${tax.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-foreground/70">
                      <span>Discount</span>
                      <span className="font-semibold text-foreground">-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-foreground/20 pt-4 flex justify-between text-xl font-bold text-foreground">
                    <span>Total</span>
                    <span className="text-button">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <CustomizationPolicyNotice items={cartLines} className="pt-2" />
                </div>
                {adminShoppingBlocked && (
                  <div className="mb-4 p-4 rounded-xl border border-gold-500/30 bg-gold-500/10 text-sm text-foreground/80">
                    {ADMIN_SHOPPING_BLOCKED_MESSAGE}
                  </div>
                )}
                <button
                  onClick={handleCheckout}
                  disabled={loading || adminShoppingBlocked}
                  className="w-full bg-button text-button-text font-semibold py-4 rounded-xl hover:bg-button-200 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Proceed to Checkout
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
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                  )}
                </button>
                {!isAuthenticated && (
                  <p className="text-sm text-center text-foreground/70">
                    <Link href="/login" className="text-button hover:underline">
                      Sign in
                    </Link>{' '}
                    for saved addresses, or use{' '}
                    <Link href="/guest-checkout" className="text-button hover:underline">
                      guest checkout
                    </Link>
                  </p>
                )}
                <Link
                  href="/"
                  className="block text-center text-foreground/70 hover:text-button font-medium mt-4"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
    </>
  );
}

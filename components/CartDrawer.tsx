import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart, type CartItem } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CartLineCustomizationTags } from '@/components/CartLineCustomizationTags';
import { CartQuantityControls } from '@/components/CartQuantityControls';
import { ProductImage } from '@/components/ProductImage';
import { notificationService } from '@/services/notificationService';
import { IMAGE_SIZES } from '@/lib/imageSizes';
import {
  dedupeGuestCartLines,
  getCartLineOptions,
  sameCartVariant,
  type CustomizableLine,
} from '@/services/productCustomizationService';
import { ADMIN_SHOPPING_BLOCKED_MESSAGE, isAdminUser } from '@/lib/adminShopping';

function isRecentlyAdded(
  line: CustomizableLine & { productId: string },
  lastAdded: Omit<CartItem, 'id'> | null
): boolean {
  if (!lastAdded) return false;
  return line.productId === lastAdded.productId && sameCartVariant(line, lastAdded);
}

export function CartDrawer() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const {
    items,
    subtotal,
    tax,
    total,
    itemCount,
    loading,
    isDrawerOpen,
    lastAddedItem,
    closeDrawer,
    removeItem,
    updateQuantity,
  } = useCart();

  const adminShoppingBlocked = isAuthenticated && isAdminUser(user);
  const cartLines = useMemo(() => dedupeGuestCartLines(items), [items]);
  const lineCount = cartLines.length;
  const justAdded = lastAddedItem != null;

  useEffect(() => {
    if (!isDrawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  const handleCheckout = () => {
    if (adminShoppingBlocked) {
      notificationService.error(ADMIN_SHOPPING_BLOCKED_MESSAGE);
      return;
    }
    if (cartLines.length === 0) {
      notificationService.error('Cart is empty');
      return;
    }

    closeDrawer();
    router.push(isAuthenticated ? '/checkout' : '/guest-checkout');
  };

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]" role="presentation">
      <button
        type="button"
        aria-label="Close cart"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity duration-200"
        onClick={closeDrawer}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className="absolute flex flex-col bg-primary/98 backdrop-blur-xl shadow-2xl border-foreground/10 overflow-hidden transition-transform duration-300 ease-out
          inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl border-t translate-y-0
          sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:bottom-auto sm:max-h-none sm:h-full sm:w-full sm:max-w-md sm:rounded-none sm:rounded-l-3xl sm:border-t-0 sm:border-l sm:translate-x-0 sm:translate-y-0"
      >
        <div className="shrink-0 px-5 pt-5 pb-4 border-b border-foreground/10">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-foreground/20 sm:hidden" aria-hidden />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {justAdded && (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
                <h2 id="cart-drawer-title" className="text-xl font-bold text-foreground truncate">
                  {justAdded ? 'Added to your cart' : 'Your cart'}
                </h2>
              </div>
              <p className="text-sm text-foreground/60">
                {lineCount === 0
                  ? 'No items yet'
                  : `${itemCount} ${itemCount === 1 ? 'item' : 'items'} · $${subtotal.toFixed(2)} subtotal`}
              </p>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              className="shrink-0 rounded-xl p-2 text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition-colors touch-manipulation"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 min-h-0">
          {cartLines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground/5 border border-foreground/10">
                <svg className="h-8 w-8 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-foreground font-semibold mb-1">Your cart is empty</p>
              <p className="text-sm text-foreground/60 mb-6">Add something you love — it&apos;ll show up here.</p>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  router.push('/products');
                }}
                className="px-5 py-2.5 rounded-xl bg-button text-button-text font-semibold hover:bg-button-200 transition-colors touch-manipulation"
              >
                Browse products
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {cartLines.map((item) => {
                const highlighted = isRecentlyAdded(item, lastAddedItem);
                return (
                  <li
                    key={item.id}
                    className={`flex gap-3 rounded-2xl border p-3 min-w-0 overflow-hidden transition-colors ${
                      highlighted
                        ? 'border-emerald-500/40 bg-emerald-500/10 ring-1 ring-emerald-500/20'
                        : 'border-foreground/15 bg-primary/60'
                    }`}
                  >
                    <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden border border-foreground/10">
                      <ProductImage
                        src={item.image}
                        alt={item.name}
                        sizes={IMAGE_SIZES.cartDrawerThumb}
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground break-words line-clamp-2">{item.name}</p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, getCartLineOptions(item))}
                          className="shrink-0 text-foreground/40 hover:text-red-400 transition-colors p-1 -mr-1 touch-manipulation"
                          aria-label={`Remove ${item.name}`}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <CartLineCustomizationTags line={item} />
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <CartQuantityControls
                          compact
                          quantity={item.quantity}
                          disabled={loading}
                          onDecrement={() =>
                            updateQuantity(item.productId, item.quantity - 1, getCartLineOptions(item))
                          }
                          onIncrement={() =>
                            updateQuantity(item.productId, item.quantity + 1, getCartLineOptions(item))
                          }
                        />
                        <p className="text-sm font-bold text-button tabular-nums shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <p className="text-xs text-foreground/50 mt-1 tabular-nums">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {cartLines.length > 0 && (
          <div className="shrink-0 border-t border-foreground/10 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-primary/95">
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-foreground/70">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-foreground/70">
                <span>Estimated tax</span>
                <span className="font-semibold text-foreground tabular-nums">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-foreground pt-1 border-t border-foreground/10">
                <span>Total</span>
                <span className="text-button tabular-nums">${total.toFixed(2)}</span>
              </div>
            </div>

            {adminShoppingBlocked && (
              <p className="mb-3 rounded-xl border border-gold-500/30 bg-gold-500/10 px-3 py-2 text-xs text-foreground/80">
                {ADMIN_SHOPPING_BLOCKED_MESSAGE}
              </p>
            )}

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading || adminShoppingBlocked}
                className="w-full rounded-xl bg-button py-3.5 text-button-text font-semibold hover:bg-button-200 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                {loading ? 'Updating…' : 'Checkout'}
              </button>
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="w-full rounded-xl border border-foreground/20 py-3 text-center text-sm font-semibold text-foreground hover:border-button/40 hover:text-button transition-colors touch-manipulation"
              >
                View full cart
              </Link>
              <button
                type="button"
                onClick={closeDrawer}
                className="w-full py-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors touch-manipulation"
              >
                Continue shopping
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

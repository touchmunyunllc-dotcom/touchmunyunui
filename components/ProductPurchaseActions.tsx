import { useState } from 'react';
import { useRouter } from 'next/router';
import { Product } from '@/services/productService';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notificationService';
import { productHref } from '@/lib/productRoutes';
import { ADMIN_SHOPPING_BLOCKED_MESSAGE, isAdminUser } from '@/lib/adminShopping';
import {
  isWristbandProduct,
  toDefaultCartPayload,
} from '@/services/productCustomizationService';

type ProductPurchaseActionsProps = {
  product: Product;
  compact?: boolean;
};

export function ProductPurchaseActions({ product, compact = false }: ProductPurchaseActionsProps) {
  const router = useRouter();
  const { addItem, ensureGuestCartLoaded } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  const isOutOfStock = product.stock === 0;
  const adminBlocked = isAuthenticated && isAdminUser(user);
  const needsCustomization = isWristbandProduct(product);
  const busy = addingToCart || buyingNow;

  const btnBase = compact
    ? 'flex-1 py-2 px-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all touch-manipulation'
    : 'flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all touch-manipulation';

  const goToProductPage = () => {
    notificationService.success('Choose band color, number, and writing color on the product page');
    router.push(productHref(product.id));
  };

  const ensureCanPurchase = () => {
    if (adminBlocked) {
      notificationService.error(ADMIN_SHOPPING_BLOCKED_MESSAGE);
      return false;
    }
    if (isOutOfStock) {
      notificationService.error('This product is out of stock');
      return false;
    }
    return true;
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!ensureCanPurchase() || busy) return;

    if (needsCustomization) {
      goToProductPage();
      return;
    }

    setAddingToCart(true);
    try {
      await addItem(toDefaultCartPayload(product, 1), { merge: 'add' });
    } catch {
      // CartContext shows error
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!ensureCanPurchase() || busy) return;

    if (needsCustomization) {
      goToProductPage();
      return;
    }

    setBuyingNow(true);
    try {
      await addItem(toDefaultCartPayload(product, 1), { merge: 'set' });
      ensureGuestCartLoaded();
      router.push(isAuthenticated ? '/checkout' : '/guest-checkout');
    } catch {
      // CartContext shows error
    } finally {
      setBuyingNow(false);
    }
  };

  return (
    <div
      className={`flex gap-2 ${compact ? 'mt-2' : 'mt-3'}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock || busy || adminBlocked}
        className={`${btnBase} ${
          isOutOfStock || adminBlocked
            ? 'bg-white/5 text-white/40 border border-white/10 cursor-not-allowed'
            : 'bg-white/10 border border-white/15 text-white hover:bg-white/15 hover:border-red-500/40'
        }`}
      >
        {addingToCart ? 'Adding…' : isOutOfStock ? 'Sold out' : 'Add to Cart'}
      </button>
      <button
        type="button"
        onClick={handleBuyNow}
        disabled={isOutOfStock || busy || adminBlocked}
        className={`${btnBase} ${
          isOutOfStock || adminBlocked
            ? 'bg-white/5 text-white/40 border border-white/10 cursor-not-allowed'
            : 'bg-red-600 text-white hover:bg-red-700'
        }`}
      >
        {buyingNow ? '…' : 'Buy Now'}
      </button>
    </div>
  );
}

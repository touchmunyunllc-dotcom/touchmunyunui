'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from './AuthContext';
import { cartService } from '@/services/cartService';
import { notificationService } from '@/services/notificationService';
import { ADMIN_SHOPPING_BLOCKED_MESSAGE, isAdminUser } from '@/lib/adminShopping';
import { sameCartVariant, dedupeGuestCartLines, mergeGuestCartLine, type GuestCartMergeMode } from '@/services/productCustomizationService';

const GUEST_CART_COOKIE = 'cart';
const GUEST_CART_COOKIE_OPTS = { expires: 7, path: '/' } as const;

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedColor?: string;
  selectedSize?: string;
  customNumber?: string;
  writingColor?: string;
  customizationPolicy?: string;
}

/** When multiple cart lines share the same productId (different color/size), pass this so the correct line is updated. */
export type CartLineKey = {
  selectedColor?: string;
  selectedSize?: string;
  customNumber?: string;
  writingColor?: string;
  /** Server cart row id — most precise when available */
  cartLineId?: string;
};

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>, options?: { merge?: GuestCartMergeMode }) => Promise<void>;
  removeItem: (productId: string, line?: CartLineKey) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, line?: CartLineKey) => Promise<void>;
  clearCart: () => Promise<void>;
  /** Sync read of guest cart (cookie written immediately on add — use after Add to cart). */
  readGuestCart: () => CartItem[];
  /** Re-read guest cookie into state (Buy Now → guest-checkout race). */
  ensureGuestCartLoaded: () => boolean;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
  loading: boolean;
}

function findCartLine(
  items: CartItem[],
  productId: string,
  line?: CartLineKey
): CartItem | undefined {
  if (line?.cartLineId) {
    return items.find((i) => i.id === line.cartLineId);
  }
  if (line && (line.selectedColor !== undefined || line.selectedSize !== undefined)) {
    return items.find(
      (i) => i.productId === productId && sameCartVariant(i, line)
    );
  }
  return items.find((i) => i.productId === productId);
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const guestTaxRate = 0.1;
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Load cart on mount and when user changes
  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated]);

  const loadCart = async () => {
    if (isAuthenticated && user) {
      try {
        setLoading(true);

        // Merge guest cookie cart into account cart (login / register / session restore)
        const guestItems = parseGuestCartCookie();
        if (guestItems.length > 0) {
          let serverCart;
          try {
            serverCart = await cartService.getCart();
          } catch {
            serverCart = null;
          }

          for (const item of guestItems) {
            try {
              const existing = serverCart?.items.find(
                (s) =>
                  s.productId === item.productId &&
                  sameCartVariant(s, item)
              );
              const nextQty = Math.min(
                10,
                (existing?.quantity ?? 0) + item.quantity
              );
              await cartService.addToCart(
                item.productId,
                nextQty,
                item.selectedColor,
                item.selectedSize,
                item.customNumber,
                item.writingColor
              );
              if (serverCart && existing) {
                existing.quantity = nextQty;
              } else if (serverCart) {
                serverCart.items.push({
                  id: 'pending',
                  productId: item.productId,
                  productName: item.name,
                  productPrice: item.price,
                  productImageUrl: item.image,
                  quantity: nextQty,
                  subtotal: item.price * nextQty,
                  selectedColor: item.selectedColor,
                  selectedSize: item.selectedSize,
                  customNumber: item.customNumber,
                  writingColor: item.writingColor,
                  customizationPolicy: item.customizationPolicy,
                });
              }
            } catch (mergeError) {
              console.error('Failed to merge guest cart line:', mergeError);
            }
          }
          Cookies.remove(GUEST_CART_COOKIE, { path: '/' });
        }

        const cart = await cartService.getCart();
        const mappedItems: CartItem[] = cart.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          name: item.productName || '',
          price: item.productPrice || 0,
          quantity: item.quantity,
          image: item.productImageUrl || '',
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          customNumber: item.customNumber,
          writingColor: item.writingColor,
          customizationPolicy: item.customizationPolicy,
        }));
        setItems(mappedItems);
        setSubtotal(cart.subtotal || 0);
        setTax(cart.tax || 0);
        setDiscount(cart.discount || 0);
        setTotal(cart.total || 0);
      } catch (error) {
        console.error('Failed to load cart from backend:', error);
        loadLocalCart();
      } finally {
        setLoading(false);
      }
    } else {
      loadLocalCart();
    }
  };

  const parseGuestCartCookie = (): CartItem[] => {
    const savedCart = Cookies.get(GUEST_CART_COOKIE);
    if (!savedCart) return [];
    try {
      const parsed = JSON.parse(savedCart) as Array<Partial<CartItem>>;
      const normalized = parsed
        .map((item, index) => {
          const productId = String(item.productId ?? item.id ?? '').trim();
          const lineId = String(item.id ?? `${productId}-${index}`).trim();

          return {
            id: lineId,
            productId,
            name: String(item.name ?? '').trim(),
            price: Number(item.price ?? 0),
            quantity: Number(item.quantity ?? 0),
            image: String(item.image ?? ''),
            selectedColor: item.selectedColor,
            selectedSize: item.selectedSize,
            customNumber: item.customNumber,
            writingColor: item.writingColor,
            customizationPolicy: item.customizationPolicy,
          };
        })
        .filter((item) => item.productId.length > 0 && item.quantity > 0);
      return dedupeGuestCartLines(normalized) as CartItem[];
    } catch (error) {
      console.error('Failed to parse cart from cookies', error);
      return [];
    }
  };

  const loadLocalCart = () => {
    const normalized = parseGuestCartCookie();
    setItems(normalized);
    persistGuestCart(normalized);
  };

  const readGuestCart = useCallback((): CartItem[] => {
    const fromCookie = parseGuestCartCookie();
    if (fromCookie.length > 0) return fromCookie;
    return dedupeGuestCartLines(itemsRef.current) as CartItem[];
  }, []);

  const ensureGuestCartLoaded = (): boolean => {
    if (isAuthenticated) return items.length > 0;
    if (items.length > 0) return true;
    const normalized = parseGuestCartCookie();
    if (normalized.length === 0) return false;
    setItems(normalized);
    updateGuestSummary(normalized);
    return true;
  };

  const updateGuestSummary = (guestItems: CartItem[]) => {
    const nextSubtotal = guestItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const nextTax = nextSubtotal * guestTaxRate;
    setSubtotal(nextSubtotal);
    setTax(nextTax);
    setDiscount(0);
    setTotal(nextSubtotal + nextTax);
  };

  const persistGuestCart = (guestItems: CartItem[]) => {
    if (guestItems.length === 0) {
      Cookies.remove(GUEST_CART_COOKIE, { path: '/' });
    } else {
      Cookies.set(GUEST_CART_COOKIE, JSON.stringify(guestItems), GUEST_CART_COOKIE_OPTS);
    }
    updateGuestSummary(guestItems);
  };

  // Backup sync when items change from React state (e.g. after hydration).
  useEffect(() => {
    if (isAuthenticated || items.length === 0) return;
    const deduped = dedupeGuestCartLines(items) as CartItem[];
    if (deduped.length !== items.length) {
      setItems(deduped);
      return;
    }
    Cookies.set(GUEST_CART_COOKIE, JSON.stringify(deduped), GUEST_CART_COOKIE_OPTS);
    updateGuestSummary(deduped);
  }, [items, isAuthenticated]);

  const addItem = async (item: Omit<CartItem, 'id'>, options?: { merge?: GuestCartMergeMode }) => {
    const mergeMode = options?.merge ?? 'add';

    if (isAuthenticated && isAdminUser(user)) {
      notificationService.error(ADMIN_SHOPPING_BLOCKED_MESSAGE);
      throw new Error(ADMIN_SHOPPING_BLOCKED_MESSAGE);
    }

    if (isAuthenticated && user) {
      try {
        setLoading(true);
        await cartService.addToCart(
          item.productId,
          item.quantity,
          item.selectedColor,
          item.selectedSize,
          item.customNumber,
          item.writingColor
        );
        await loadCart();
      } catch (error: any) {
        console.error('Failed to add item to cart:', error);
        notificationService.apiError(error, 'Failed to add item to cart');
        throw error;
      } finally {
        setLoading(false);
      }
    } else {
      setItems((prevItems) => {
        const nextItems = dedupeGuestCartLines(
          mergeGuestCartLine(prevItems as Parameters<typeof mergeGuestCartLine>[0], item, mergeMode)
        ) as CartItem[];
        persistGuestCart(nextItems);
        return nextItems;
      });
    }
  };

  const removeItem = async (productId: string, line?: CartLineKey) => {
    if (isAuthenticated && user) {
      const item = findCartLine(items, productId, line);
      if (item) {
        try {
          setLoading(true);
          await cartService.removeFromCart(item.id);
          await loadCart();
        } catch (error: any) {
          console.error('Failed to remove item from cart:', error);
          notificationService.error('Failed to remove item from cart');
        } finally {
          setLoading(false);
        }
      }
    } else {
      setItems((prevItems) => {
        const nextItems = prevItems.filter((i) => {
          if (i.productId !== productId) return true;
          if (!line) return false;
          return !sameCartVariant(i, line);
        });
        persistGuestCart(nextItems);
        return nextItems;
      });
    }
  };

  const updateQuantity = async (productId: string, quantity: number, line?: CartLineKey) => {
    const MAX_QUANTITY = 10;
    if (quantity > MAX_QUANTITY) {
      notificationService.error(`Maximum quantity allowed per product is ${MAX_QUANTITY}`);
      return;
    }

    if (quantity <= 0) {
      await removeItem(productId, line);
      return;
    }

    if (isAuthenticated && user) {
      const item = findCartLine(items, productId, line);
      if (item) {
        try {
          setLoading(true);
          await cartService.updateCartItem(item.id, quantity);
          await loadCart();
        } catch (error: any) {
          console.error('Failed to update cart item:', error);
          notificationService.error(
            error.response?.data?.message || 'Failed to update cart item'
          );
        } finally {
          setLoading(false);
        }
      }
    } else {
      setItems((prevItems) => {
        const nextItems = prevItems.map((i) =>
          i.productId === productId && (!line || sameCartVariant(i, line))
            ? { ...i, quantity }
            : i
        );
        persistGuestCart(nextItems);
        return nextItems;
      });
    }
  };

  const clearCart = async () => {
    if (isAuthenticated && user) {
      try {
        setLoading(true);
        await cartService.clearCart();
        await loadCart();
      } catch (error: any) {
        console.error('Failed to clear cart:', error);
        notificationService.error('Failed to clear cart');
      } finally {
        setLoading(false);
      }
    } else {
      setItems([]);
      persistGuestCart([]);
    }
  };
  const itemCount = isAuthenticated
    ? items.length
    : dedupeGuestCartLines(items).length;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        ensureGuestCartLoaded,
        readGuestCart,
        subtotal,
        tax,
        discount,
        total,
        itemCount,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};


'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from './AuthContext';
import { cartService } from '@/services/cartService';
import { notificationService } from '@/services/notificationService';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedColor?: string;
  selectedSize?: number;
  customNumber?: string;
  writingColor?: string;
}

/** When multiple cart lines share the same productId (different color/size), pass this so the correct line is updated. */
export type CartLineKey = {
  selectedColor?: string;
  selectedSize?: number;
  customNumber?: string;
  writingColor?: string;
  /** Server cart row id — most precise when available */
  cartLineId?: string;
};

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeItem: (productId: string, line?: CartLineKey) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, line?: CartLineKey) => Promise<void>;
  clearCart: () => Promise<void>;
  /** Re-read guest cookie into state (Buy Now → guest-checkout race). */
  ensureGuestCartLoaded: () => boolean;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
  loading: boolean;
}

function sameVariant(
  a: { selectedColor?: string; selectedSize?: number; customNumber?: string; writingColor?: string },
  b: { selectedColor?: string; selectedSize?: number; customNumber?: string; writingColor?: string }
) {
  return (
    (a.selectedColor ?? '') === (b.selectedColor ?? '') &&
    (a.selectedSize ?? null) === (b.selectedSize ?? null) &&
    (a.customNumber ?? '') === (b.customNumber ?? '') &&
    (a.writingColor ?? '') === (b.writingColor ?? '')
  );
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
      (i) => i.productId === productId && sameVariant(i, line)
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
                  sameVariant(s, item)
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
                });
              }
            } catch (mergeError) {
              console.error('Failed to merge guest cart line:', mergeError);
            }
          }
          Cookies.remove('cart');
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
    const savedCart = Cookies.get('cart');
    if (!savedCart) return [];
    try {
      const parsed = JSON.parse(savedCart) as Array<Partial<CartItem>>;
      return parsed
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
          };
        })
        .filter((item) => item.productId.length > 0 && item.quantity > 0);
    } catch (error) {
      console.error('Failed to parse cart from cookies', error);
      return [];
    }
  };

  const loadLocalCart = () => {
    const normalized = parseGuestCartCookie();
    if (normalized.length > 0) {
      setItems(normalized);
      updateGuestSummary(normalized);
    }
  };

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

  // Save to local storage for guest users
  useEffect(() => {
    if (!isAuthenticated && items.length > 0) {
      Cookies.set('cart', JSON.stringify(items), { expires: 7 });
      updateGuestSummary(items);
    } else if (!isAuthenticated && items.length === 0) {
      Cookies.remove('cart');
      updateGuestSummary([]);
    }
  }, [items, isAuthenticated]);

  const addItem = async (item: Omit<CartItem, 'id'>) => {
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
        notificationService.error(
          error.response?.data?.message || 'Failed to add item to cart'
        );
        throw error;
      } finally {
        setLoading(false);
      }
    } else {
      // Sync cookie before navigate (Buy Now → guest-checkout)
      const existingItem = items.find(
        (i) => i.productId === item.productId && sameVariant(i, item)
      );
      const nextItems = existingItem
        ? items.map((i) =>
            i.productId === item.productId && sameVariant(i, item)
              ? { ...i, quantity: item.quantity }
              : i
          )
        : [...items, { ...item, id: Date.now().toString() }];
      Cookies.set('cart', JSON.stringify(nextItems), { expires: 7 });
      setItems(nextItems);
      updateGuestSummary(nextItems);
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
          return !sameVariant(i, line);
        });
        updateGuestSummary(nextItems);
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
          i.productId === productId && (!line || sameVariant(i, line))
            ? { ...i, quantity }
            : i
        );
        updateGuestSummary(nextItems);
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
      updateGuestSummary([]);
    }
  };
  const itemCount = items.length;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        ensureGuestCartLoaded,
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


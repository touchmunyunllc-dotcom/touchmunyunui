import apiClient from './apiClient';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImageUrl: string;
  quantity: number;
  subtotal: number;
  selectedColor?: string;
  selectedSize?: number;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  appliedCoupon?: {
    code: string;
    discountValue: number;
    discountType: string;
  };
}

export const cartService = {
  async addToCart(productId: string, quantity: number, selectedColor?: string, selectedSize?: number): Promise<CartItem> {
    const response = await apiClient.post<CartItem>('/cart/add', {
      productId,
      quantity,
      selectedColor,
      selectedSize,
    });
    return response.data;
  },

  async removeFromCart(itemId: string): Promise<void> {
    await apiClient.delete(`/cart/remove/${itemId}`);
  },

  async getCart(couponCode?: string): Promise<CartSummary> {
    const params = couponCode ? { couponCode } : {};
    const response = await apiClient.get<CartSummary>('/cart/view', { params });
    return response.data;
  },

  async updateCartItem(itemId: string, quantity: number): Promise<void> {
    await apiClient.put(`/cart/item/${itemId}`, { quantity });
  },

  async applyCoupon(couponCode: string): Promise<CartSummary> {
    const response = await apiClient.post<CartSummary>('/cart/apply-coupon', {
      couponCode,
    });
    return response.data;
  },

  async clearCart(): Promise<void> {
    await apiClient.delete('/cart/clear');
  },
};


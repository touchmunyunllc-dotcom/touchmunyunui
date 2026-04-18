import apiClient from './apiClient';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

export interface Order {
  id: string;
  orderCode: string;
  userId: string;
  totalAmount: number;
  status: 'Pending' | 'Paid' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  couponId?: string;
  shippingAddressId?: string;
  stripePaymentIntentId?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt?: string;
  orderItems: OrderItem[];
}

export const orderService = {
  async getUserOrders(startDate?: string, endDate?: string, limit: number = 5): Promise<Order[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('limit', limit.toString());
    
    const response = await apiClient.get<Order[]>(`/orders/user?${params.toString()}`);
    return response.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async getOrderByPaymentIntent(paymentIntentId: string): Promise<Order> {
    const response = await apiClient.get<Order>(
      `/orders/by-payment-intent/${encodeURIComponent(paymentIntentId)}`
    );
    return response.data;
  },

  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    const response = await apiClient.post<Order>(`/orders/${orderId}/cancel`, {
      reason,
    });
    return response.data;
  },
};


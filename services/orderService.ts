import apiClient from './apiClient';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  selectedColor?: string;
  selectedSize?: string;
  customNumber?: string;
  writingColor?: string;
  product?: {
    id: string;
    name: string;
    imageUrl: string;
    customizationPolicy?: string | null;
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

export interface UserOrdersPage {
  orders: Order[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type OrderStatusTab = 'all' | 'pending' | 'delivered' | 'cancelled';

export interface UserOrdersSummary {
  totalCount: number;
  pending: number;
  delivered: number;
  cancelled: number;
}

export const orderService = {
  async getUserOrdersSummary(options?: {
    startDate?: string;
    endDate?: string;
  }): Promise<UserOrdersSummary> {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);

    const query = params.toString();
    const response = await apiClient.get<{
      totalCount?: number;
      TotalCount?: number;
      pending?: number;
      Pending?: number;
      delivered?: number;
      Delivered?: number;
      cancelled?: number;
      Cancelled?: number;
    }>(`/orders/user/summary${query ? `?${query}` : ''}`);

    const data = response.data;
    return {
      totalCount: data.totalCount ?? data.TotalCount ?? 0,
      pending: data.pending ?? data.Pending ?? 0,
      delivered: data.delivered ?? data.Delivered ?? 0,
      cancelled: data.cancelled ?? data.Cancelled ?? 0,
    };
  },

  /** Paginated list for My Orders page */
  async getUserOrdersPaginated(options?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
    statusGroup?: OrderStatusTab;
  }): Promise<UserOrdersPage> {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.statusGroup && options.statusGroup !== 'all') {
      params.append('statusGroup', options.statusGroup);
    }
    params.append('page', String(options?.page ?? 1));
    params.append('pageSize', String(options?.pageSize ?? 10));

    const response = await apiClient.get<{
      orders?: Order[];
      Orders?: Order[];
      totalCount?: number;
      TotalCount?: number;
      page?: number;
      Page?: number;
      pageSize?: number;
      PageSize?: number;
      totalPages?: number;
      TotalPages?: number;
    }>(`/orders/user?${params.toString()}`);

    const data = response.data;
    const orders = data.orders ?? data.Orders ?? [];
    const totalCount = data.totalCount ?? data.TotalCount ?? 0;
    const page = data.page ?? data.Page ?? 1;
    const pageSize = data.pageSize ?? data.PageSize ?? 10;
    const totalPages = data.totalPages ?? data.TotalPages ?? 0;

    return {
      orders,
      totalCount,
      page,
      pageSize,
      totalPages: totalPages || Math.max(1, Math.ceil(totalCount / Math.max(pageSize, 1))),
    };
  },

  /** Legacy limit-based fetch (e.g. order-success lookup) */
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


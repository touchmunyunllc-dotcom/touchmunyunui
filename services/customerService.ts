import apiClient from './apiClient';

export interface Customer {
  id: string;
  name: string;
  email: string;
  role: string;
  provider?: string;
  totalOrders: number;
  totalSpent: number;
  cancellationCount: number;
  orderBlockedUntil?: string;
  createdAt: string;
}

export interface CustomerDetail extends Customer {
  updatedAt?: string;
  recentOrders: Array<{
    orderId: string;
    orderCode: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
}

export interface CustomersResponse {
  customers: Customer[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const customerService = {
  async getAll(page: number = 1, pageSize: number = 10, search?: string): Promise<CustomersResponse> {
    const params: any = { page, pageSize };
    if (search) params.search = search;
    
    const response = await apiClient.get<any>('/admin/customers', { params });
    const data = response.data;
    
    return {
      customers: (data.customers || data.Customers || []).map((c: any) => ({
        id: c.id || c.Id || '',
        name: c.name || c.Name || '',
        email: c.email || c.Email || '',
        role: c.role || c.Role || '',
        provider: c.provider || c.Provider,
        totalOrders: c.totalOrders || c.TotalOrders || 0,
        totalSpent: c.totalSpent || c.TotalSpent || 0,
        cancellationCount: c.cancellationCount || c.CancellationCount || 0,
        orderBlockedUntil: c.orderBlockedUntil || c.OrderBlockedUntil,
        createdAt: c.createdAt || c.CreatedAt || '',
      })),
      totalCount: data.totalCount || data.TotalCount || 0,
      page: data.page || data.Page || 1,
      pageSize: data.pageSize || data.PageSize || 10,
      totalPages: data.totalPages || data.TotalPages || 0,
    };
  },

  async getById(id: string): Promise<CustomerDetail> {
    try {
      const response = await apiClient.get<any>(`/admin/customers/${id}`);
      const data = response.data;
      
      if (!data) {
        throw new Error('No data received from server');
      }
      
      return {
        id: data.id || data.Id || '',
        name: data.name || data.Name || '',
        email: data.email || data.Email || '',
        role: data.role || data.Role || '',
        provider: data.provider || data.Provider,
        totalOrders: data.totalOrders ?? data.TotalOrders ?? 0,
        totalSpent: data.totalSpent ?? data.TotalSpent ?? 0,
        cancellationCount: data.cancellationCount ?? data.CancellationCount ?? 0,
        orderBlockedUntil: data.orderBlockedUntil || data.OrderBlockedUntil,
        createdAt: data.createdAt || data.CreatedAt || '',
        updatedAt: data.updatedAt || data.UpdatedAt,
        recentOrders: (data.recentOrders || data.RecentOrders || []).map((o: any) => ({
          orderId: o.orderId || o.OrderId || o.order_id || '',
          orderCode: o.orderCode || o.OrderCode || o.order_code || '',
          totalAmount: o.totalAmount ?? o.TotalAmount ?? o.total_amount ?? 0,
          status: o.status || o.Status || '',
          createdAt: o.createdAt || o.CreatedAt || o.created_at || '',
        })),
      };
    } catch (error: any) {
      console.error('Error in customerService.getById:', error);
      throw error;
    }
  },
};


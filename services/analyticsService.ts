import apiClient from './apiClient';

export interface DashboardStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface OrdersSummary {
  byStatus: Array<{
    status: string;
    count: number;
    totalAmount: number;
  }>;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface TopProduct {
  productId: string;
  productName: string;
  price: number;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface TimeSeriesData {
  date: string;
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
}

export interface DailyRevenueRow {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface RevenueStats {
  dailyRevenue: DailyRevenueRow[];
  period: {
    startDate: string;
    endDate: string;
  };
}

export const analyticsService = {
  async getDashboardStats(startDate?: string, endDate?: string): Promise<DashboardStats> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await apiClient.get<any>('/admin/analytics/dashboard', { params });
    const data = response.data;
    
    return {
      totalOrders: data.totalOrders || data.TotalOrders || 0,
      completedOrders: data.completedOrders || data.CompletedOrders || 0,
      pendingOrders: data.pendingOrders || data.PendingOrders || 0,
      totalRevenue: data.totalRevenue || data.TotalRevenue || 0,
      averageOrderValue: data.averageOrderValue || data.AverageOrderValue || 0,
      totalCustomers: data.totalCustomers || data.TotalCustomers || 0,
      period: data.period || data.Period || { startDate: '', endDate: '' },
    };
  },

  async getRevenue(startDate?: string, endDate?: string): Promise<RevenueStats> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiClient.get<any>('/admin/analytics/revenue', { params });
    const data = response.data;
    const rows = data.dailyRevenue || data.DailyRevenue || [];
    const period = data.period || data.Period || {};

    return {
      dailyRevenue: (rows as any[]).map((d) => {
        const raw = d.date ?? d.Date;
        const dateStr =
          typeof raw === 'string'
            ? raw
            : raw
              ? new Date(raw).toISOString()
              : '';
        return {
          date: dateStr,
          revenue: Number(d.revenue ?? d.Revenue ?? 0),
          orderCount: Number(d.orderCount ?? d.OrderCount ?? 0),
        };
      }),
      period: {
        startDate: String(period.startDate ?? period.StartDate ?? ''),
        endDate: String(period.endDate ?? period.EndDate ?? ''),
      },
    };
  },

  async getOrdersSummary(startDate?: string, endDate?: string): Promise<OrdersSummary> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await apiClient.get<any>('/admin/analytics/orders/summary', { params });
    const data = response.data;
    
    return {
      byStatus: (data.byStatus || data.ByStatus || []).map((s: any) => ({
        status: s.status || s.Status || '',
        count: s.count || s.Count || 0,
        totalAmount: s.totalAmount || s.TotalAmount || 0,
      })),
      period: data.period || data.Period || { startDate: '', endDate: '' },
    };
  },

  async getTopProducts(limit: number = 10, startDate?: string, endDate?: string): Promise<TopProduct[]> {
    const params: any = { limit };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await apiClient.get<any[]>('/admin/analytics/products/top-selling', { params });
    
    return (response.data || []).map((p: any) => ({
      productId: p.productId || p.ProductId || '',
      productName: p.productName || p.ProductName || '',
      price: p.price || p.Price || 0,
      totalQuantitySold: p.totalQuantitySold || p.TotalQuantitySold || 0,
      totalRevenue: p.totalRevenue || p.TotalRevenue || 0,
    }));
  },

  async getTimeSeriesData(startDate?: string, endDate?: string, groupBy: 'day' | 'month' | 'year' = 'day'): Promise<TimeSeriesData[]> {
    const params: any = { groupBy };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await apiClient.get<any[]>('/admin/analytics/time-series', { params });
    
    return (response.data || []).map((t: any) => {
      // Convert date to ISO string if it's a DateTime object
      let dateStr = '';
      try {
        if (t.date) {
          dateStr = typeof t.date === 'string' ? t.date : new Date(t.date).toISOString();
        } else if (t.Date) {
          dateStr = typeof t.Date === 'string' ? t.Date : new Date(t.Date).toISOString();
        } else {
          // Try to parse as date from any format
          const dateValue = t.date || t.Date;
          if (dateValue) {
            dateStr = new Date(dateValue).toISOString();
          }
        }
      } catch (error) {
        console.error('Error parsing date:', error, t);
        dateStr = new Date().toISOString();
      }
      
      return {
        date: dateStr,
        totalOrders: Number(t.totalOrders || t.TotalOrders || 0),
        completedOrders: Number(t.completedOrders || t.CompletedOrders || 0),
        totalRevenue: Number(t.totalRevenue || t.TotalRevenue || 0),
        averageOrderValue: Number(t.averageOrderValue || t.AverageOrderValue || 0),
        totalCustomers: Number(t.totalCustomers || t.TotalCustomers || 0),
      };
    }).filter(item => item.date); // Remove invalid entries
  },
};


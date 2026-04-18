import apiClient from './apiClient';

export interface Coupon {
  id: string;
  code: string;
  discountType: 'Percentage' | 'FixedAmount';
  discountValue: number;
  expiryDate?: string;
  usageLimit?: number;
  usageCount?: number;
  isActive: boolean;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  createdAt: string;
}

export interface CouponValidation {
  id: string;
  code: string;
  discountAmount: number;
  discountType: string;
}

export const couponService = {
  /** Public marketing list (homepage ticker, etc.) — uses GET /coupons/promo */
  async getPromo(): Promise<Coupon[]> {
    const response = await apiClient.get<Coupon[]>('/coupons/promo');
    return Array.isArray(response.data) ? response.data : [];
  },

  async getAll(options?: { page?: number; pageSize?: number }): Promise<Coupon[] | { coupons: Coupon[]; totalCount: number; page: number; pageSize: number; totalPages: number }> {
    const response = await apiClient.get<any>('/coupons', {
      params: options,
    });
    
    // Check if response is paginated
    if (response.data.coupons || response.data.Coupons) {
      return {
        coupons: response.data.coupons || response.data.Coupons || [],
        totalCount: response.data.totalCount || response.data.TotalCount || 0,
        page: response.data.page || response.data.Page || 1,
        pageSize: response.data.pageSize || response.data.PageSize || 10,
        totalPages: response.data.totalPages || response.data.TotalPages || 0,
      };
    }
    
    // Backward compatibility - return array
    return Array.isArray(response.data) ? response.data : [];
  },

  async validate(code: string): Promise<CouponValidation> {
    const response = await apiClient.get<CouponValidation>(`/coupons/validate/${code}`);
    return response.data;
  },

  async create(coupon: Omit<Coupon, 'id' | 'createdAt' | 'usageCount'>): Promise<Coupon> {
    const response = await apiClient.post<Coupon>('/admin/coupons', coupon);
    return response.data;
  },

  async update(id: string, coupon: Partial<Coupon>): Promise<Coupon> {
    const response = await apiClient.put<Coupon>(`/admin/coupons/${id}`, coupon);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/coupons/${id}`);
  },
};


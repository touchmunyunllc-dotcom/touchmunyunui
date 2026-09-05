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

type CouponApiRecord = Partial<Coupon> & {
  Id?: string;
  Code?: string;
  DiscountType?: Coupon['discountType'] | string;
  DiscountValue?: number;
  ExpiryDate?: string;
  UsageLimit?: number;
  UsageCount?: number;
  IsActive?: boolean;
  MinPurchaseAmount?: number;
  MaxDiscountAmount?: number;
  CreatedAt?: string;
};

/** Map API payload (camelCase or PascalCase) to storefront Coupon shape. */
export function normalizeCoupon(raw: CouponApiRecord): Coupon | null {
  const code = String(raw.code ?? raw.Code ?? '').trim();
  if (!code) return null;

  const discountTypeRaw = String(raw.discountType ?? raw.DiscountType ?? 'Percentage');
  const discountType: Coupon['discountType'] =
    discountTypeRaw.toLowerCase() === 'fixedamount' ? 'FixedAmount' : 'Percentage';

  return {
    id: String(raw.id ?? raw.Id ?? code),
    code,
    discountType,
    discountValue: Number(raw.discountValue ?? raw.DiscountValue ?? 0),
    expiryDate: raw.expiryDate ?? raw.ExpiryDate,
    usageLimit: raw.usageLimit ?? raw.UsageLimit,
    usageCount: raw.usageCount ?? raw.UsageCount,
    isActive: raw.isActive ?? raw.IsActive ?? true,
    minPurchaseAmount: Number(raw.minPurchaseAmount ?? raw.MinPurchaseAmount ?? 0),
    maxDiscountAmount: raw.maxDiscountAmount ?? raw.MaxDiscountAmount,
    createdAt: String(raw.createdAt ?? raw.CreatedAt ?? new Date().toISOString()),
  };
}

/** Active, non-expired coupons for marketing UI — sourced from Admin → Coupons (GET /coupons/promo). */
export async function fetchPromoCoupons(): Promise<Coupon[]> {
  const response = await apiClient.get<CouponApiRecord[]>('/coupons/promo');
  const rows = Array.isArray(response.data) ? response.data : [];

  return rows
    .map((row) => normalizeCoupon(row))
    .filter((coupon): coupon is Coupon => {
      if (!coupon || !coupon.isActive) return false;
      if (coupon.expiryDate && new Date(coupon.expiryDate) <= new Date()) return false;
      if (
        coupon.usageLimit != null &&
        coupon.usageCount != null &&
        coupon.usageCount >= coupon.usageLimit
      ) {
        return false;
      }
      return true;
    });
}

export const couponService = {
  /** Public marketing list (homepage hero, cart) — Admin → Coupons only; no static fallback. */
  getPromo: fetchPromoCoupons,

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


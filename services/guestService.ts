import publicApiClient from './publicApiClient';

export interface GuestOrderItemPayload {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface GuestCheckoutPreview {
  subtotal: number;
  tax: number;
  totalAmount: number;
  couponApplied: boolean;
}

export interface GuestCheckoutPayload {
  email: string;
  name: string;
  items: GuestOrderItemPayload[];
  totalAmount: number;
  currency: string;
  couponCode?: string;
  captchaToken: string | null;
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface GuestCheckoutResponse {
  orderCode: string | null;
  clientSecret: string;
  paymentIntentId: string;
  orderId: string | null;
}

export interface GuestOrderLine {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    imageUrl?: string;
  };
}

export interface GuestOrderDetail {
  orderCode: string;
  guestEmail?: string;
  totalAmount: number;
  status: string;
  trackingNumber?: string;
  trackingUrl?: string;
  orderItems?: GuestOrderLine[];
}

export const guestService = {
  async previewTotal(items: GuestOrderItemPayload[], couponCode?: string): Promise<GuestCheckoutPreview> {
    const response = await publicApiClient.post<GuestCheckoutPreview>('/guest/preview-total', {
      items,
      couponCode: couponCode || null,
    });
    return response.data;
  },

  async checkout(payload: GuestCheckoutPayload): Promise<GuestCheckoutResponse> {
    const response = await publicApiClient.post<GuestCheckoutResponse>('/guest/checkout', payload);
    return response.data;
  },

  async getGuestOrder(orderCode: string): Promise<GuestOrderDetail> {
    const response = await publicApiClient.get<GuestOrderDetail>(
      `/guest/order/${encodeURIComponent(orderCode)}`
    );
    return response.data;
  },
};

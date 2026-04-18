import { loadStripe, Stripe } from '@stripe/stripe-js';
import apiClient from './apiClient';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
    );
  }
  return stripePromise;
};

export interface ResolveCheckoutSessionResult {
  paymentIntentId: string | null;
  orderId: string | null;
  orderCode: string | null;
  sessionComplete: boolean;
}

export const stripeService = {
  /** Server builds cart total; redirects to Stripe Hosted Checkout. */
  async createCheckoutSession(couponCode?: string, shippingAddressId?: string, currency?: string) {
    const response = await apiClient.post<{ sessionId: string; url: string }>(
      '/payments/create-checkout-session',
      { couponCode, shippingAddressId, currency: currency || 'usd' }
    );
    return response.data;
  },

  async resolveCheckoutSession(sessionId: string): Promise<ResolveCheckoutSessionResult> {
    const response = await apiClient.get<ResolveCheckoutSessionResult>(
      `/payments/resolve-checkout-session?sessionId=${encodeURIComponent(sessionId)}`
    );
    return response.data;
  },

  async createPaymentIntent(amount: number, currency: string = 'usd', couponCode?: string, shippingAddressId?: string) {
    const response = await apiClient.post('/payments/create-intent', {
      amount,
      currency,
      couponCode,
      shippingAddressId,
    });
    return response.data;
  },

  async confirmStripeCheckout(paymentIntentId: string) {
    const response = await apiClient.post<{
      orderId: string;
      orderCode: string;
    }>('/payments/confirm-stripe-checkout', { paymentIntentId });
    return response.data;
  },

  async createCodOrder(amount: number, currency: string = 'usd', couponCode?: string, shippingAddressId?: string) {
    console.log('stripeService.createCodOrder called', { amount, currency, couponCode, shippingAddressId });
    try {
      const response = await apiClient.post('/payments/create-cod-order', {
        amount,
        currency,
        couponCode,
        shippingAddressId,
      });
      console.log('COD order API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('COD order API error:', error);
      throw error;
    }
  },
};

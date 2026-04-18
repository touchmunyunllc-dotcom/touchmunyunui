import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { guestService, GuestCheckoutPreview } from '@/services/guestService';
import { getStripe } from '@/services/stripeService';
import { notificationService } from '@/services/notificationService';
import { useRecaptcha } from '@/utils/useRecaptcha';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '@/components/StripePaymentForm';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const CURRENCY = 'usd';

function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export default function GuestCheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { items, total, clearCart } = useCart();
  const { executeRecaptcha } = useRecaptcha();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [couponCode, setCouponCode] = useState('');
  const couponRef = useRef(couponCode);
  useEffect(() => {
    couponRef.current = couponCode;
  }, [couponCode]);

  const [preview, setPreview] = useState<GuestCheckoutPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const mapItems = useCallback(() => {
    return items.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    }));
  }, [items]);

  const runPreview = useCallback(async () => {
    if (items.length === 0) return;
    for (const i of items) {
      if (!isValidUuid(i.productId)) {
        notificationService.error('Invalid product in cart. Please remove the item and add it again.');
        return;
      }
    }
    setPreviewLoading(true);
    try {
      const p = await guestService.previewTotal(
        mapItems(),
        couponRef.current.trim() || undefined
      );
      setPreview(p);
    } catch (e: any) {
      notificationService.error(
        e.response?.data?.message || e.message || 'Could not calculate order total'
      );
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }, [items, mapItems]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/checkout');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!router.isReady || isAuthenticated) return;
    if (items.length === 0) {
      router.replace('/cart');
      return;
    }
    void runPreview();
  }, [router.isReady, isAuthenticated, items.length, router, runPreview]);

  const validateShipping = (): boolean => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notificationService.error('Valid email is required');
      return false;
    }
    if (!name.trim()) {
      notificationService.error('Name is required');
      return false;
    }
    if (!addressLine1.trim() || !city.trim() || !stateVal.trim() || !postalCode.trim() || !country.trim()) {
      notificationService.error('Please complete the shipping address');
      return false;
    }
    return true;
  };

  const handleStartPayment = async () => {
    if (!validateShipping()) return;
    if (!preview) {
      notificationService.error('Order totals are still loading. Please wait.');
      return;
    }

    setSubmitLoading(true);
    try {
      const captchaToken = await executeRecaptcha('guest_checkout');
      const latest = await guestService.previewTotal(
        mapItems(),
        couponRef.current.trim() || undefined
      );
      setPreview(latest);

      const res = await guestService.checkout({
        email: email.trim(),
        name: name.trim(),
        items: mapItems(),
        totalAmount: latest.totalAmount,
        currency: CURRENCY,
        couponCode: couponRef.current.trim() || undefined,
        captchaToken,
        shippingAddress: {
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || undefined,
          city: city.trim(),
          state: stateVal.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
        },
      });

      setClientSecret(res.clientSecret);
      setShowPaymentForm(true);
    } catch (e: any) {
      notificationService.error(
        e.response?.data?.message || e.message || 'Could not start payment'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!router.isReady || isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <Layout>
      <SEO title="Guest checkout - Touch Munyun" noindex nofollow />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-primary min-h-screen">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-4xl font-bold text-foreground">Guest checkout</h1>
          <Link href="/login" className="text-button hover:underline text-sm">
            Sign in instead
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-primary/80 rounded-2xl shadow-lg p-6 border border-foreground/20">
              <h2 className="text-xl font-semibold text-foreground mb-4">Contact & shipping</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm text-foreground/80">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-primary/60 border border-foreground/20 px-3 py-2 text-foreground"
                    autoComplete="email"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-foreground/80">Full name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-primary/60 border border-foreground/20 px-3 py-2 text-foreground"
                    autoComplete="name"
                  />
                </label>
                <label className="md:col-span-2 block">
                  <span className="text-sm text-foreground/80">Address line 1</span>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-primary/60 border border-foreground/20 px-3 py-2 text-foreground"
                  />
                </label>
                <label className="md:col-span-2 block">
                  <span className="text-sm text-foreground/80">Address line 2 (optional)</span>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-primary/60 border border-foreground/20 px-3 py-2 text-foreground"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-foreground/80">City</span>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-primary/60 border border-foreground/20 px-3 py-2 text-foreground"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-foreground/80">State / Province</span>
                  <input
                    type="text"
                    value={stateVal}
                    onChange={(e) => setStateVal(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-primary/60 border border-foreground/20 px-3 py-2 text-foreground"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-foreground/80">Postal code</span>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-primary/60 border border-foreground/20 px-3 py-2 text-foreground"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-foreground/80">Country</span>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-primary/60 border border-foreground/20 px-3 py-2 text-foreground"
                  />
                </label>
              </div>
            </div>

            <div className="bg-primary/80 rounded-2xl shadow-lg p-6 border border-foreground/20">
              <h2 className="text-xl font-semibold text-foreground mb-4">Coupon</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Code"
                  className="flex-1 rounded-lg bg-primary/60 border border-foreground/20 px-3 py-2 text-foreground"
                />
                <button
                  type="button"
                  onClick={() => void runPreview()}
                  disabled={previewLoading}
                  className="px-4 py-2 bg-primary/60 border border-foreground/25 rounded-lg text-foreground hover:bg-primary/80"
                >
                  {previewLoading ? '…' : 'Apply'}
                </button>
              </div>
            </div>

            <div className="bg-primary/80 rounded-2xl shadow-lg p-6 border border-foreground/20">
              <h2 className="text-xl font-semibold text-foreground mb-4">Items</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center border-b border-foreground/10 pb-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-primary/60">
                      <Image
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-sm text-foreground/70">Qty {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-button">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-primary/80 rounded-2xl shadow-xl p-6 sticky top-24 border border-foreground/20">
              <h2 className="text-2xl font-bold text-foreground mb-4">Order summary</h2>
              {previewLoading && <p className="text-foreground/70 text-sm">Calculating…</p>}
              {preview && !previewLoading && (
                <div className="space-y-2 mb-6 text-foreground/90">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${preview.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%)</span>
                    <span>${preview.tax.toFixed(2)}</span>
                  </div>
                  {preview.couponApplied && (
                    <p className="text-sm text-gold-500">Coupon applied</p>
                  )}
                  <div className="border-t border-foreground/20 pt-2 flex justify-between text-xl font-bold text-button">
                    <span>Total</span>
                    <span>${preview.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
              <p className="text-xs text-foreground/60 mb-4">
                Cart subtotal (before tax): ${total.toFixed(2)} — final total is confirmed by the server.
              </p>
              <button
                type="button"
                onClick={() => void handleStartPayment()}
                disabled={submitLoading || previewLoading || !preview}
                className="w-full py-4 bg-button text-button-text rounded-xl font-semibold hover:bg-button-200 disabled:opacity-50"
              >
                {submitLoading ? 'Starting…' : 'Continue to secure payment'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPaymentForm && clientSecret && preview && (
        <Elements
          stripe={getStripe()}
          options={{
            clientSecret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#c9a961',
                fontFamily: '"Inter", sans-serif',
              },
            },
          }}
        >
          <StripePaymentForm
            clientSecret={clientSecret}
            amount={preview.totalAmount}
            onSuccess={async (paymentIntentId) => {
              setShowPaymentForm(false);
              await clearCart();
              notificationService.success('Payment successful!');
              router.push(`/guest-order-success?payment_intent=${encodeURIComponent(paymentIntentId)}`);
            }}
            onError={(err) => {
              console.error(err);
            }}
            onCancel={() => {
              setShowPaymentForm(false);
              setClientSecret(null);
            }}
          />
        </Elements>
      )}
    </Layout>
  );
}

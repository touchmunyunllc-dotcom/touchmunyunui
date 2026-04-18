import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { stripeService, getStripe } from '@/services/stripeService';
import { couponService } from '@/services/couponService';
import { cartService } from '@/services/cartService';
import { notificationService } from '@/services/notificationService';
import { addressService, Address } from '@/services/addressService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '@/components/StripePaymentForm';
import { SEO } from '@/components/SEO';

export default function Checkout() {
  const { isAuthenticated, user } = useAuth();
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [finalTotal, setFinalTotal] = useState(total);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod'>('stripe');

  // Address form state
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [saveAddress, setSaveAddress] = useState(true);

  // Stripe payment state (order is created after payment succeeds)
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  /** Align tax/discount/total with server cart (same rules as payment validation). */
  const syncCartTotals = useCallback(async (couponCodeArg?: string | null) => {
    try {
      const summary = await cartService.getCart(couponCodeArg || undefined);
      setTax(summary.tax);
      setDiscount(summary.discount);
      setFinalTotal(summary.total);
    } catch (e) {
      console.error('Failed to sync cart totals', e);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    // Pre-fill name and email from user
    if (user?.name) setFullName(user.name);
    if (user?.email) setEmail(user.email);

    // Load saved addresses
    const loadAddresses = async () => {
      try {
        const addresses = await addressService.getUserAddresses();
        setSavedAddresses(addresses);
        // Auto-select default address
        const defaultAddr = addresses.find(a => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (addresses.length > 0) {
          setSelectedAddressId(addresses[0].id);
        } else {
          setUseNewAddress(true);
        }
      } catch (error) {
        // No saved addresses, show new address form
        setUseNewAddress(true);
      }
    };
    loadAddresses();
  }, [items.length, isAuthenticated, router, user]);

  useEffect(() => {
    if (!isAuthenticated || items.length === 0) return;
    void syncCartTotals(appliedCoupon?.code ?? null);
  }, [isAuthenticated, items.length, total, appliedCoupon?.code, syncCartTotals]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      notificationService.error('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    try {
      const coupon = await couponService.validate(couponCode);
      setAppliedCoupon(coupon);
      await syncCartTotals(coupon.code);
      notificationService.success('Coupon applied successfully!');
    } catch (error: any) {
      notificationService.error(
        error.response?.data?.message || 'Invalid coupon code'
      );
      setAppliedCoupon(null);
      await syncCartTotals(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const resolveShippingAddressId = async (): Promise<string | undefined> => {
    if (items.length === 0) {
      notificationService.error('Cart is empty');
      return undefined;
    }

    let shippingAddressId: string | undefined;

    if (useNewAddress) {
      if (!fullName.trim()) {
        notificationService.error('Please enter your full name');
        return undefined;
      }
      if (!email.trim()) {
        notificationService.error('Please enter your email address');
        return undefined;
      }
      if (!phone.trim()) {
        notificationService.error('Please enter your phone number');
        return undefined;
      }
      if (!addressLine1.trim()) {
        notificationService.error('Please enter your street address');
        return undefined;
      }
      if (!city.trim()) {
        notificationService.error('Please enter your city');
        return undefined;
      }
      if (!state.trim()) {
        notificationService.error('Please enter your state/province');
        return undefined;
      }
      if (!postalCode.trim()) {
        notificationService.error('Please enter your ZIP/postal code');
        return undefined;
      }
      if (!country.trim()) {
        notificationService.error('Please select your country');
        return undefined;
      }

      try {
        const newAddress = await addressService.createAddress({
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || undefined,
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
          phone: phone.trim(),
          isDefault: saveAddress && savedAddresses.length === 0,
        });
        shippingAddressId = newAddress.id;
      } catch {
        notificationService.error('Failed to save address. Please try again.');
        return undefined;
      }
    } else {
      if (!selectedAddressId) {
        notificationService.error('Please select a shipping address');
        return undefined;
      }
      shippingAddressId = selectedAddressId;
    }

    return shippingAddressId;
  };

  const handleCheckout = async () => {
    const shippingAddressId = await resolveShippingAddressId();
    if (!shippingAddressId) return;

    setLoading(true);
    try {
      if (paymentMethod === 'cod') {
        console.log('Creating COD order...', { finalTotal, couponCode: appliedCoupon?.code, shippingAddressId });
        const result = await stripeService.createCodOrder(
          finalTotal,
          'usd',
          appliedCoupon?.code,
          shippingAddressId
        );

        console.log('COD order created:', result);
        notificationService.success(result.message || 'Order placed successfully!');
        router.push(`/order-success?orderId=${result.orderId}&orderCode=${result.orderCode}`);
      } else {
        const paymentIntent = await stripeService.createPaymentIntent(
          finalTotal,
          'usd',
          appliedCoupon?.code,
          shippingAddressId
        );

        setClientSecret(paymentIntent.clientSecret);
        setShowPaymentForm(true);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      console.error('Error response:', error.response);
      notificationService.error(
        error.response?.data?.message || error.message || 'Failed to process checkout'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStripeHostedCheckout = async () => {
    if (paymentMethod !== 'stripe') {
      notificationService.info('Select Credit/Debit Card to use Stripe Checkout.');
      return;
    }
    const shippingAddressId = await resolveShippingAddressId();
    if (!shippingAddressId) return;

    setLoading(true);
    try {
      const { url } = await stripeService.createCheckoutSession(
        appliedCoupon?.code,
        shippingAddressId
      );
      window.location.href = url;
    } catch (error: any) {
      console.error('Hosted checkout error:', error);
      notificationService.error(
        error.response?.data?.message || error.message || 'Could not start Stripe Checkout'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Checkout - Touch Munyun" noindex nofollow />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-primary min-h-screen">
        <h1 className="text-4xl font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-primary/80 backdrop-blur-md rounded-2xl shadow-glass-lg p-6 border border-foreground/20">
              <h2 className="text-2xl font-semibold text-foreground mb-6">Order Items</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-foreground/20 last:border-b-0">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-primary/60">
                      <Image
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      {(item.selectedColor || item.selectedSize) && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.selectedColor && (
                            <span className="text-xs px-2 py-0.5 bg-button/10 text-button border border-button/20 rounded-md">
                              Color: {item.selectedColor}
                            </span>
                          )}
                          {item.selectedSize && (
                            <span className="text-xs px-2 py-0.5 bg-button/10 text-button border border-button/20 rounded-md">
                              Size: {item.selectedSize}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-foreground/70">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-button">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-primary/80 backdrop-blur-md rounded-2xl shadow-glass-lg p-6 border border-foreground/20">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Shipping Address</h2>

              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <div className="mb-4">
                  <div className="space-y-3 mb-4">
                    {savedAddresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-primary/50 transition-colors ${
                          !useNewAddress && selectedAddressId === addr.id
                            ? 'border-button bg-button/10'
                            : 'border-foreground/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="shippingAddress"
                          checked={!useNewAddress && selectedAddressId === addr.id}
                          onChange={() => {
                            setSelectedAddressId(addr.id);
                            setUseNewAddress(false);
                          }}
                          className="w-4 h-4 mt-1 text-button focus:ring-button"
                        />
                        <div className="ml-3 flex-1">
                          <div className="font-semibold text-foreground">
                            {addr.addressLine1}
                            {addr.isDefault && (
                              <span className="ml-2 text-xs px-2 py-0.5 bg-button/20 text-button rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          {addr.addressLine2 && (
                            <div className="text-sm text-foreground/70">{addr.addressLine2}</div>
                          )}
                          <div className="text-sm text-foreground/70">
                            {addr.city}, {addr.state} {addr.postalCode}
                          </div>
                          <div className="text-sm text-foreground/70">{addr.country}</div>
                          {addr.phone && (
                            <div className="text-sm text-foreground/70">Phone: {addr.phone}</div>
                          )}
                        </div>
                      </label>
                    ))}

                    {/* New Address option */}
                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-primary/50 transition-colors ${
                        useNewAddress ? 'border-button bg-button/10' : 'border-foreground/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingAddress"
                        checked={useNewAddress}
                        onChange={() => setUseNewAddress(true)}
                        className="w-4 h-4 text-button focus:ring-button"
                      />
                      <div className="ml-3">
                        <div className="font-semibold text-foreground">+ Add New Address</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* New Address Form */}
              {useNewAddress && (
                <div className="space-y-4">
                  {/* Name & Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-2 border border-foreground/20 rounded-lg bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 focus:bg-primary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2 border border-foreground/20 rounded-lg bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 focus:bg-primary outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-2 border border-foreground/20 rounded-lg bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 focus:bg-primary outline-none transition-all"
                    />
                  </div>

                  {/* Address Line 1 */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Street Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="123 Main Street"
                      className="w-full px-4 py-2 border border-foreground/20 rounded-lg bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 focus:bg-primary outline-none transition-all"
                    />
                  </div>

                  {/* Address Line 2 */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Apartment, Suite, etc. <span className="text-foreground/40">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Apt 4B, Floor 2"
                      className="w-full px-4 py-2 border border-foreground/20 rounded-lg bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 focus:bg-primary outline-none transition-all"
                    />
                  </div>

                  {/* City & State row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        City <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="New York"
                        className="w-full px-4 py-2 border border-foreground/20 rounded-lg bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 focus:bg-primary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        State / Province <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="New York"
                        className="w-full px-4 py-2 border border-foreground/20 rounded-lg bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 focus:bg-primary outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Postal Code & Country row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        ZIP / Postal Code <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="10001"
                        className="w-full px-4 py-2 border border-foreground/20 rounded-lg bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 focus:bg-primary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Country <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-2 border border-foreground/20 rounded-lg bg-primary/60 backdrop-blur-sm text-foreground focus:ring-2 focus:ring-button/50 focus:border-button/50 focus:bg-primary outline-none transition-all"
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="India">India</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Japan">Japan</option>
                        <option value="Brazil">Brazil</option>
                        <option value="Mexico">Mexico</option>
                        <option value="South Korea">South Korea</option>
                        <option value="Singapore">Singapore</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                        <option value="South Africa">South Africa</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="New Zealand">New Zealand</option>
                        <option value="Italy">Italy</option>
                        <option value="Spain">Spain</option>
                        <option value="Netherlands">Netherlands</option>
                      </select>
                    </div>
                  </div>

                  {/* Save Address checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="w-4 h-4 rounded text-button focus:ring-button border-foreground/30"
                    />
                    <span className="text-sm text-foreground/70">Save this address for future orders</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Order Total & Coupon */}
          <div className="lg:col-span-1">
            <div className="bg-primary/80 backdrop-blur-md rounded-2xl shadow-glass-lg p-6 sticky top-4 border border-foreground/20">
              <h2 className="text-2xl font-semibold text-foreground mb-6">Order Summary</h2>

              {/* Coupon Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2 border border-foreground/20 rounded-lg bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 focus:bg-primary outline-none transition-all disabled:opacity-50"
                    disabled={!!appliedCoupon}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !!appliedCoupon}
                    className="px-4 py-2 bg-button text-button-text rounded-lg hover:bg-button-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                  >
                    {applyingCoupon ? '...' : appliedCoupon ? 'Applied' : 'Apply'}
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="mt-2 text-sm text-gold-500 font-medium">
                    Coupon {appliedCoupon.code} applied! (-${discount.toFixed(2)})
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-foreground/70">
                  <span>Subtotal</span>
                  <span className="text-foreground">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-foreground/70">
                  <span>Tax (10%)</span>
                  <span className="text-foreground">${tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-gold-500 font-semibold">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-foreground/20 pt-3">
                  <div className="flex justify-between text-xl font-bold text-button">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Payment Method
                </label>
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-primary/50 transition-colors ${
                    paymentMethod === 'stripe' ? 'border-button bg-button/10' : 'border-foreground/20'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'stripe' | 'cod')}
                      className="w-4 h-4 text-button focus:ring-button"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-semibold text-foreground">Credit/Debit Card</div>
                      <div className="text-sm text-foreground/70">Pay securely with Stripe</div>
                    </div>
                    <div className="ml-3">
                      <svg className="w-6 h-6 text-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-primary/50 transition-colors ${
                    paymentMethod === 'cod' ? 'border-button bg-button/10' : 'border-foreground/20'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'stripe' | 'cod')}
                      className="w-4 h-4 text-button focus:ring-button"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-semibold text-foreground">Cash on Delivery (COD)</div>
                      <div className="text-sm text-foreground/70">Pay when you receive your order</div>
                    </div>
                    <div className="ml-3">
                      <svg className="w-6 h-6 text-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </label>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Checkout button clicked', { paymentMethod, finalTotal });
                  handleCheckout();
                }}
                disabled={loading}
                className="w-full py-4 bg-button text-button-text rounded-xl font-semibold text-lg hover:bg-button-200 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading 
                  ? 'Processing...' 
                  : paymentMethod === 'cod' 
                    ? 'Place Order (COD)' 
                    : 'Proceed to Payment'}
              </button>

              {paymentMethod === 'stripe' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void handleStripeHostedCheckout();
                  }}
                  disabled={loading}
                  className="w-full mt-3 py-3 bg-primary/60 border border-foreground/25 text-foreground rounded-xl font-semibold hover:bg-primary/80 transition-all disabled:opacity-50"
                >
                  Pay on Stripe&apos;s secure page (hosted checkout)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Payment Modal */}
      {showPaymentForm && clientSecret && (
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
            amount={finalTotal}
            onSuccess={(paymentIntentId) => {
              setShowPaymentForm(false);
              notificationService.success('Payment successful! Finalizing your order…');
              router.push(
                `/order-success?payment_intent=${encodeURIComponent(paymentIntentId)}`
              );
            }}
            onError={(error) => {
              console.error('Payment error:', error);
              // Keep modal open so user can retry
            }}
            onCancel={() => {
              setShowPaymentForm(false);
              setClientSecret(null);
              notificationService.info('Payment cancelled. Your cart is unchanged.');
            }}
          />
        </Elements>
      )}
    </Layout>
  );
}


import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { orderService, Order } from '@/services/orderService';
import { stripeService } from '@/services/stripeService';
import { notificationService } from '@/services/notificationService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';
import { SEO } from '@/components/SEO';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function OrderSuccess() {
  const router = useRouter();
  const {
    orderCode,
    orderId,
    payment_intent: paymentIntentQuery,
    session_id: sessionIdQuery,
  } = router.query;
  const { isAuthenticated } = useAuth();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const cartClearedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!router.isReady) {
      return;
    }

    const loadOrderAfterStripe = async (pi: string) => {
      try {
        await stripeService.confirmStripeCheckout(pi);
      } catch {
        /* webhook may have fulfilled first */
      }
      const maxAttempts = 24;
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const o = await orderService.getOrderByPaymentIntent(pi);
          return o;
        } catch {
          await sleep(1500);
        }
      }
      return null;
    };

    const fetchOrder = async () => {
      try {
        let loaded: Order | null = null;
        const piRaw = paymentIntentQuery;
        const pi = typeof piRaw === 'string' ? piRaw : Array.isArray(piRaw) ? piRaw[0] : undefined;

        const sidRaw = sessionIdQuery;
        const sessionId =
          typeof sidRaw === 'string' ? sidRaw : Array.isArray(sidRaw) ? sidRaw[0] : undefined;

        if (sessionId) {
          const maxAttempts = 24;
          for (let i = 0; i < maxAttempts; i++) {
            try {
              const resolved = await stripeService.resolveCheckoutSession(sessionId);
              if (resolved.orderId) {
                try {
                  loaded = await orderService.getOrderById(resolved.orderId);
                  if (loaded) break;
                } catch {
                  /* order may not be readable yet */
                }
              }
              if (resolved.sessionComplete && resolved.paymentIntentId) {
                try {
                  await stripeService.confirmStripeCheckout(resolved.paymentIntentId);
                } catch {
                  /* webhook may have fulfilled */
                }
                try {
                  loaded = await orderService.getOrderByPaymentIntent(resolved.paymentIntentId);
                  if (loaded) break;
                } catch {
                  /* retry */
                }
              }
            } catch {
              /* retry */
            }
            if (loaded) break;
            await sleep(1500);
          }
          setOrder(loaded);
          if (!loaded) {
            notificationService.error(
              'We could not load your order yet. Check My Orders or contact support if you were charged.'
            );
          }
        } else if (pi) {
          loaded = await loadOrderAfterStripe(pi);
          setOrder(loaded);
          if (!loaded) {
            notificationService.error(
              'We could not load your order yet. Check My Orders or contact support if you were charged.'
            );
          }
        } else if (orderId) {
          loaded = await orderService.getOrderById(orderId as string);
          setOrder(loaded);
        } else if (orderCode) {
          const orders = await orderService.getUserOrders();
          const foundOrder = orders.find((o) => o.orderCode === orderCode);
          if (foundOrder) {
            loaded = foundOrder;
            setOrder(foundOrder);
          } else {
            setOrder(null);
          }
        }
        if (loaded && !cartClearedRef.current) {
          await clearCart();
          cartClearedRef.current = true;
        }
      } catch {
        notificationService.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (paymentIntentQuery || orderCode || orderId || sessionIdQuery) {
      void fetchOrder();
    } else {
      setLoading(false);
    }
  }, [
    router.isReady,
    orderCode,
    orderId,
    paymentIntentQuery,
    sessionIdQuery,
    isAuthenticated,
    router,
    clearCart,
  ]);

  if (loading) {
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
      <SEO title="Order Confirmed - Touch Munyun" noindex nofollow />
      <div className="min-h-screen bg-primary py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Success Icon and Message */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
              <svg
                className="h-12 w-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-primary-500 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-lg text-gray-400">
              Thank you for your purchase. We&apos;ve received your order and will process it shortly.
            </p>
            {order && (
              <p className="text-xl font-semibold text-primary-600 mt-4">
                Order #{order.orderCode || order.id.slice(0, 8)}
              </p>
            )}
          </div>

          {/* Order Details Card */}
          {order && (
            <div className="bg-primary/80 backdrop-blur-md rounded-2xl shadow-glass-lg p-6 mb-6 border border-foreground/20">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {order.orderItems?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 pb-4 border-b border-foreground/20 last:border-b-0"
                  >
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-primary/60">
                      {item.product?.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-foreground/50">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {item.product?.name || 'Product'}
                      </h3>
                      <p className="text-sm text-foreground/70">
                        Quantity: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold text-button">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-foreground/20 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-button">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-button/20 border border-button/30 rounded-lg">
                <p className="text-sm text-foreground">
                  <strong className="text-button">What&apos;s next?</strong> You&apos;ll receive an email
                  confirmation shortly. We&apos;ll notify you when your order is shipped.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/orders"
              className="flex-1 px-6 py-3 bg-button text-button-text rounded-lg font-semibold hover:bg-button-200 text-center transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              View All Orders
            </Link>
            {order && (
              <Link
                href={`/orders/${order.id}`}
                className="flex-1 px-6 py-3 bg-primary/60 backdrop-blur-sm border-2 border-button text-foreground rounded-lg font-semibold hover:bg-primary/80 text-center transition-all"
              >
                View Order Details
              </Link>
            )}
            <Link
              href="/products"
              className="flex-1 px-6 py-3 bg-primary/60 backdrop-blur-sm border border-foreground/20 text-foreground rounded-lg font-semibold hover:bg-primary/80 text-center transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

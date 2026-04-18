import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { Layout } from '@/components/Layout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SEO } from '@/components/SEO';
import publicApiClient from '@/services/publicApiClient';
import { guestService, GuestOrderDetail, GuestOrderLine } from '@/services/guestService';
import { notificationService } from '@/services/notificationService';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function GuestOrderSuccess() {
  const router = useRouter();
  const { payment_intent: paymentIntentQuery } = router.query;
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<GuestOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;

    const piRaw = paymentIntentQuery;
    const pi =
      typeof piRaw === 'string' ? piRaw : Array.isArray(piRaw) ? piRaw[0] : undefined;

    if (!pi) {
      setLoading(false);
      return;
    }

    const poll = async () => {
      const maxAttempts = 36;
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const { data } = await publicApiClient.get<{ fulfilled: boolean; orderCode: string | null }>(
            `/guest/checkout-status?paymentIntentId=${encodeURIComponent(pi)}`
          );
          if (data.fulfilled && data.orderCode) {
            setOrderCode(data.orderCode);
            try {
              const detail = await guestService.getGuestOrder(data.orderCode);
              setOrderDetail(detail);
            } catch {
              /* order fetch optional */
            }
            setLoading(false);
            return;
          }
        } catch {
          /* retry */
        }
        await sleep(1500);
      }
      notificationService.error(
        'We could not confirm your order yet. If you were charged, save your payment receipt and contact support with this payment reference: ' +
          pi
      );
      setLoading(false);
    };

    void poll();
  }, [router.isReady, paymentIntentQuery]);

  const lines: GuestOrderLine[] = orderDetail?.orderItems ?? [];

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
      <SEO title="Order confirmation - Touch Munyun" noindex nofollow />
      <div className="min-h-screen bg-primary py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {orderCode ? (
            <>
              <div className="text-center space-y-2">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-2">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-primary-500">Thank you!</h1>
                <p className="text-foreground/80">
                  Your payment was received. Your order number is{' '}
                  <span className="font-semibold text-button">{orderCode}</span>.
                </p>
                {orderDetail && (
                  <p className="text-sm text-foreground/60">
                    Confirmation sent to {orderDetail.guestEmail ?? 'your email'} when processing completes.
                  </p>
                )}
              </div>

              {lines.length > 0 && (
                <div className="bg-primary/80 rounded-2xl border border-foreground/20 p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Order items</h2>
                  <ul className="space-y-4">
                    {lines.map((line) => (
                      <li key={line.id} className="flex gap-4 items-center">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-primary/60 shrink-0">
                          {line.product?.imageUrl ? (
                            <Image
                              src={line.product.imageUrl}
                              alt={line.product.name || 'Product'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-foreground/40 text-xs">
                              —
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {line.product?.name ?? 'Product'}
                          </p>
                          <p className="text-sm text-foreground/70">
                            Qty {line.quantity} × ${line.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold text-button">
                          ${(line.price * line.quantity).toFixed(2)}
                        </p>
                      </li>
                    ))}
                  </ul>
                  {orderDetail && (
                    <div className="mt-4 pt-4 border-t border-foreground/20 flex justify-between text-lg font-bold text-foreground">
                      <span>Total</span>
                      <span className="text-button">${orderDetail.totalAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-sm text-center text-foreground/60">
                Save this order number for your records.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/products"
                  className="px-6 py-3 bg-button text-button-text rounded-lg font-semibold hover:bg-button-200 text-center"
                >
                  Continue shopping
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground text-center">Could not load order</h1>
              <p className="text-foreground/70 text-center">
                Open your email for confirmation or contact support if payment went through.
              </p>
              <Link href="/products" className="block text-center text-button font-semibold">
                Continue shopping
              </Link>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

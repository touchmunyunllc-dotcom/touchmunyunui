import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { orderService, Order } from '@/services/orderService';
import { notificationService } from '@/services/notificationService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { OrderStatusTracker } from '@/components/OrderStatusTracker';
import { CancelOrderModal } from '@/components/CancelOrderModal';
import Image from 'next/image';

export default function OrderDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (id) {
      const fetchOrder = async () => {
        try {
          const data = await orderService.getOrderById(id as string);
          setOrder(data);
        } catch (error) {
          notificationService.error('Failed to load order');
          router.push('/orders');
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id, isAuthenticated, router]);

  const getStatusColor = (status: string | number | undefined) => {
    const statusStr = typeof status === 'number' 
      ? ['Pending', 'Paid', 'Packed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'][status] || 'Pending'
      : (status || 'Pending');
    
    switch (statusStr) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Packed':
        return 'bg-yellow-100 text-yellow-800';
      case 'Paid':
        return 'bg-purple-100 text-purple-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      case 'Processing':
        return 'bg-indigo-100 text-indigo-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string | number | undefined): string => {
    if (typeof status === 'number') {
      const statusMap = ['Pending', 'Paid', 'Packed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
      return statusMap[status] || 'Pending';
    }
    return status || 'Pending';
  };

  const canCancelOrder = (status: string | number | undefined): boolean => {
    const statusText = getStatusText(status);
    return statusText === 'Pending' || statusText === 'Paid';
  };

  const handleCancelOrder = () => {
    if (!order || !canCancelOrder(order.status)) {
      return;
    }
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!order) return;

    setCancelling(true);
    try {
      const updatedOrder = await orderService.cancelOrder(order.id, reason);
      setOrder(updatedOrder);
      setShowCancelModal(false);
      notificationService.success('Order cancelled successfully');
    } catch (error: any) {
      notificationService.error(
        error.response?.data?.message || 'Failed to cancel order'
      );
    } finally {
      setCancelling(false);
    }
  };

  // Calculate tax (10% of subtotal)
  const calculateTax = (subtotal: number): number => {
    return subtotal * 0.1;
  };

  // Calculate subtotal from order items
  const calculateSubtotal = (): number => {
    if (!order?.orderItems) return 0;
    return order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const discount = order?.couponId ? (subtotal + tax - (order.totalAmount || 0)) : 0;
  const finalTotal = order?.totalAmount || (subtotal + tax - discount);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-primary">
          <div className="text-center bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-8 border-2 border-foreground/10">
            <h1 className="text-2xl font-bold text-foreground mb-4">Order not found</h1>
            <button
              onClick={() => router.push('/orders')}
              className="bg-button text-button-text px-6 py-3 rounded-xl hover:bg-button-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-primary min-h-screen">
        <button
          onClick={() => router.push('/orders')}
          className="mb-8 text-button hover:text-button-200 flex items-center gap-2 font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Orders
        </button>

        <div className="bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-8 mb-6 border-2 border-foreground/10">
          <div className="border-b border-foreground/10 pb-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Order #{order.orderCode || order.id.slice(0, 8)}
                </h1>
                <p className="text-foreground/70">
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-foreground/70 mb-2 font-semibold">Order Status</p>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}
                >
                  {getStatusText(order.status)}
                </span>
                {canCancelOrder(order.status) && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="mt-3 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            {/* Order Status Tracker */}
            <div className="bg-primary/60 backdrop-blur-sm rounded-3xl p-6 border-2 border-foreground/10">
              <h3 className="text-xl font-bold text-foreground mb-6">Order Progress</h3>
              <OrderStatusTracker status={order.status} />
            </div>
          </div>

          {/* Tracking Information */}
          {(order.trackingNumber || order.trackingUrl) && (
            <div className="bg-blue-500/20 backdrop-blur-sm border-2 border-blue-500/30 rounded-3xl p-6 mb-6">
              <h3 className="text-sm font-bold text-blue-400 mb-3 uppercase tracking-wide">Tracking Information</h3>
              {order.trackingNumber && (
                <p className="text-sm text-foreground mb-2 font-semibold">
                  <span className="text-foreground/70">Tracking Number:</span> <span className="text-gold-400">{order.trackingNumber}</span>
                </p>
              )}
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 underline font-semibold transition-colors"
                >
                  Track Your Order →
                </a>
              )}
            </div>
          )}

          {/* Cancellation Reason (if cancelled) */}
          {getStatusText(order.status) === 'Cancelled' && order.cancellationReason && (
            <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-500/30 rounded-3xl p-6 mb-6">
              <h3 className="text-sm font-bold text-red-400 mb-3 uppercase tracking-wide">Cancellation Reason</h3>
              <p className="text-sm text-red-300 font-semibold">{order.cancellationReason}</p>
            </div>
          )}

          <div className="border-t border-foreground/10 pt-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-foreground/10 last:border-0">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-primary/60 backdrop-blur-sm border-2 border-foreground/20">
                    {item.product?.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground/40">
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
                    <h3 className="font-bold text-foreground">
                      {item.product?.name || 'Product'}
                    </h3>
                    <p className="text-sm text-foreground/70 font-medium">
                      Quantity: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-bold text-gold-400 text-lg">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-foreground/10 pt-6 mt-6">
            <div className="space-y-3">
              <div className="flex justify-between text-foreground/70 font-medium">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-foreground/70 font-medium">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-foreground/10 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-gold-400">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Order Modal */}
        <CancelOrderModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleConfirmCancel}
          loading={cancelling}
        />
      </div>
    </Layout>
  );
}


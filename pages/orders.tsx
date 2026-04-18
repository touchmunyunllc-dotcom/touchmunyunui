import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { orderService, Order } from '@/services/orderService';
import { notificationService } from '@/services/notificationService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import Image from 'next/image';
import { SEO } from '@/components/SEO';

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filterLimit] = useState<number>(5);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Validate date range if both dates are provided
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      // Don't fetch if dates are invalid, but don't show error on initial load
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getUserOrders(
          startDate || undefined,
          endDate || undefined,
          filterLimit
        );
        setOrders(data);
      } catch (error) {
        notificationService.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, router, startDate, endDate, filterLimit]);

  const handleFilterChange = () => {
    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      notificationService.error('End date must be after start date');
      return;
    }

    // Trigger refetch when filters change
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getUserOrders(
          startDate || undefined,
          endDate || undefined,
          filterLimit
        );
        setOrders(data);
      } catch (error) {
        notificationService.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

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
      <SEO title="My Orders - Touch Munyun" noindex nofollow />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-primary min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">My Orders</h1>
          <div className="text-sm text-foreground/70 font-medium">
            Showing up to {filterLimit} most recent orders
          </div>
        </div>

        {/* Date Filters */}
        <div className="bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-6 mb-8 border-2 border-foreground/10">
          <h2 className="text-lg font-bold text-foreground mb-6">Filter Orders by Date</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-semibold text-foreground mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground transition-all"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-semibold text-foreground mb-2">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground transition-all"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleFilterChange}
                className="flex-1 px-4 py-3 bg-button text-button-text rounded-xl hover:bg-button-200 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Apply Filter
              </button>
              {(startDate || endDate) && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-3 bg-primary/60 text-foreground rounded-xl hover:bg-primary/80 transition-all font-semibold border border-foreground/20"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            variant="orders"
            title="No orders yet"
            description="Get started by placing your first order. Browse our products and add items to your cart."
            action={{
              label: 'Browse Products',
              onClick: () => router.push('/products'),
            }}
          />
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="group bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg overflow-hidden hover:shadow-xl transition-all duration-500 border-2 border-foreground/10 hover:border-button/50 transform hover:scale-[1.02] hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-button transition-colors">
                        Order #{order.orderCode || order.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-foreground/70 group-hover:text-foreground/90 transition-colors">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1.5 rounded-full text-sm font-bold ${getStatusColor(
                          order.status
                        )} border-2 backdrop-blur-sm shadow-glass`}
                      >
                        {getStatusText(order.status)}
                      </span>
                      <p className="text-lg font-bold text-gold-400 mt-2 group-hover:text-gold-300 transition-colors">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-foreground/10 pt-4">
                    <div className="space-y-3">
                      {order.orderItems?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 group/item">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-primary/60 backdrop-blur-sm border-2 border-foreground/20 group-hover/item:border-button/50 transition-all">
                            {item.product?.imageUrl ? (
                              <Image
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                fill
                                className="object-cover group-hover/item:scale-110 transition-transform duration-300"
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
                            <p className="font-semibold text-foreground group-hover/item:text-button transition-colors">
                              {item.product?.name || 'Product'}
                            </p>
                            <p className="text-sm text-foreground/70 font-medium">
                              Quantity: {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-bold text-gold-400 group-hover/item:text-gold-300 transition-colors">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="text-button hover:text-button-200 font-semibold transition-colors flex items-center gap-2 group/link"
                    >
                      View Details
                      <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}


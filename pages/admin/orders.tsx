import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { OrderList } from '@/components/OrderList';
import { orderService, Order } from '@/services/orderService';
import { notificationService } from '@/services/notificationService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import apiClient from '@/services/apiClient';

interface AdminOrder {
  id: string;
  orderCode?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  guestEmail?: string;
  totalAmount: number;
  status: string;
  couponCode?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  paymentMethod?: string;
  notes?: string;
  cancellationReason?: string;
  shippingAddress?: string;
  createdAt: string;
  updatedAt?: string;
  orderItems?: Array<{
    productName: string;
    productSku: string;
    quantity: number;
    price: number;
  }>;
}

export default function AdminOrders() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // Initialize filters from query parameters and fetch orders
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
      return;
    }

    // Wait for router to be ready before accessing query params
    if (!router.isReady) {
      return;
    }

    // Read status from query parameter
    const statusFromQuery = (router.query.status as string) || '';
    
    // Update filters if query parameter has changed
    setFilters(prev => {
      if (prev.status !== statusFromQuery) {
        return { ...prev, status: statusFromQuery };
      }
      return prev;
    });
    
    // Reset to page 1 when status filter changes
    if (statusFromQuery) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [router.isReady, router.query.status, isAuthenticated, user]);

  // Fetch orders when filters, pagination, or query parameters change
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      return;
    }

    // Wait for router to be ready before fetching
    if (!router.isReady) {
      return;
    }

    fetchOrders();
  }, [isAuthenticated, user, router.isReady, router.query.status, filters.status, filters.startDate, filters.endDate, pagination.page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
      
      // Use query parameter if available, otherwise use filter state
      const statusToUse = (router.query.status as string) || filters.status;
      if (statusToUse && statusToUse.trim()) {
        params.status = statusToUse.trim();
      }
      
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await apiClient.get<{
        orders?: AdminOrder[];
        Orders?: AdminOrder[];
        totalCount?: number;
        TotalCount?: number;
        page?: number;
        Page?: number;
        pageSize?: number;
        PageSize?: number;
        totalPages?: number;
        TotalPages?: number;
      }>('/admin/orders', { params });
      
      // Handle both camelCase and PascalCase response formats
      const data = response.data as any;
      const ordersList = data.orders || data.Orders || [];
      const totalCount = data.totalCount || data.TotalCount || 0;
      const totalPages = data.totalPages || data.TotalPages || 0;
      
      setOrders(ordersList);
      setPagination({
        ...pagination,
        totalCount,
        totalPages,
      });
    } catch (error) {
      notificationService.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await apiClient.put(`/admin/orders/${orderId}/status`, { status });
      notificationService.success('Order status updated successfully');
      fetchOrders();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update order status';
      notificationService.error(errorMessage);
      console.error('Status update error:', error);
    }
  };

  const handleExportCSV = () => {
    // Escape CSV values to handle commas and quotes
    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Main order headers
    const headers = [
      'Order Code',
      'Order ID',
      'Customer Name',
      'Customer Email',
      'Guest Email',
      'Total Amount',
      'Status',
      'Payment Method',
      'Coupon Code',
      'Shipping Address',
      'Tracking Number',
      'Tracking URL',
      'Notes',
      'Cancellation Reason',
      'Created At',
      'Updated At',
      'Order Items (Product Name, SKU, Quantity, Price)'
    ];

    const rows = orders.map((order: any) => {
      // Format order items as a readable string
      const itemsStr = order.orderItems && order.orderItems.length > 0
        ? order.orderItems.map((item: any) => 
            `${item.productName || 'N/A'} (SKU: ${item.productSku || 'N/A'}) - Qty: ${item.quantity} - Price: $${item.price.toFixed(2)}`
          ).join('; ')
        : 'No items';

      return [
        escapeCSV(order.orderCode || order.id.slice(0, 8)),
        escapeCSV(order.id),
        escapeCSV(order.userName || 'Guest'),
        escapeCSV(order.userEmail || ''),
        escapeCSV(order.guestEmail || ''),
        escapeCSV(order.totalAmount.toFixed(2)),
        escapeCSV(order.status),
        escapeCSV(order.paymentMethod || 'N/A'),
        escapeCSV(order.couponCode || ''),
        escapeCSV(order.shippingAddress || ''),
        escapeCSV(order.trackingNumber || ''),
        escapeCSV(order.trackingUrl || ''),
        escapeCSV(order.notes || ''),
        escapeCSV(order.cancellationReason || ''),
        escapeCSV(new Date(order.createdAt).toLocaleString()),
        escapeCSV(order.updatedAt ? new Date(order.updatedAt).toLocaleString() : ''),
        escapeCSV(itemsStr)
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    notificationService.success('Orders exported to CSV with complete information');
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-primary min-h-screen">
        <div className="mb-4">
          <Link
            href="/admin"
            className="inline-flex items-center text-button hover:text-button-200 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Admin - Orders</h1>
          <button
            onClick={handleExportCSV}
            className="bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-6 mb-6 border-2 border-foreground/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value });
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground transition-all"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Packed">Packed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  setFilters({ ...filters, startDate: e.target.value });
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  setFilters({ ...filters, endDate: e.target.value });
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground transition-all"
              />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <OrderList
          orders={orders}
          onOrderClick={(orderId) => {
            const order = orders.find((o) => o.id === orderId);
            setSelectedOrder(order || null);
          }}
          showActions={true}
          onStatusUpdate={handleStatusUpdate}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-6 border-2 border-foreground/10">
            <div className="text-sm text-foreground/80 font-medium">
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
              {pagination.totalCount} orders
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-foreground/20 rounded-xl text-foreground hover:bg-primary/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPagination({ ...pagination, page: pageNum })}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        pagination.page === pageNum
                          ? 'bg-button text-button-text shadow-lg'
                          : 'text-foreground hover:bg-primary/60 border border-foreground/20'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 border border-foreground/20 rounded-xl text-foreground hover:bg-primary/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-primary/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 border-2 border-foreground/20 shadow-glass-lg">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Order #{selectedOrder.orderCode || selectedOrder.id.slice(0, 8)}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-5">
                <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                  <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">Order Code</p>
                  <p className="font-bold text-foreground">{selectedOrder.orderCode || selectedOrder.id.slice(0, 8)}</p>
                </div>
                <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                  <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">Customer Name</p>
                  <p className="font-semibold text-foreground">{selectedOrder.userName || 'Guest'}</p>
                </div>
                <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                  <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">Customer Email</p>
                  <p className="font-semibold text-foreground">{selectedOrder.userEmail || selectedOrder.guestEmail || 'N/A'}</p>
                </div>
                <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                  <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">Total Amount</p>
                  <p className="font-bold text-2xl text-gold-400">${selectedOrder.totalAmount.toFixed(2)}</p>
                </div>
                <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                  <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">Status</p>
                  <p className="font-semibold text-foreground">{selectedOrder.status}</p>
                </div>
                <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                  <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">Payment Method</p>
                  <p className="font-semibold text-foreground">{selectedOrder.paymentMethod || 'N/A'}</p>
                </div>
                {selectedOrder.couponCode && (
                  <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                    <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">Coupon Code</p>
                    <p className="font-semibold text-gold-400">{selectedOrder.couponCode}</p>
                  </div>
                )}
                {selectedOrder.shippingAddress && (
                  <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                    <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">Shipping Address</p>
                    <p className="font-semibold text-foreground">{selectedOrder.shippingAddress}</p>
                  </div>
                )}
                {selectedOrder.trackingNumber && (
                  <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                    <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">Tracking Number</p>
                    <p className="font-semibold text-foreground">{selectedOrder.trackingNumber}</p>
                  </div>
                )}
                    {selectedOrder.notes && (
                      <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                        <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">Notes</p>
                        <p className="font-semibold text-foreground">{selectedOrder.notes}</p>
                      </div>
                    )}
                    {selectedOrder.cancellationReason && (
                      <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border-2 border-red-500/30">
                        <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1">Cancellation Reason</p>
                        <p className="font-semibold text-red-300">{selectedOrder.cancellationReason}</p>
                      </div>
                    )}
                    <div className="flex gap-3 pt-4 border-t border-foreground/10">
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/orders/${selectedOrder.id}/invoice`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-button text-button-text px-6 py-3 rounded-xl hover:bg-button-200 font-semibold text-center flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Invoice
                      </a>
                    </div>
                <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                  <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">Created At</p>
                  <p className="font-semibold text-foreground">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedOrder.updatedAt && (
                  <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                    <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1">Updated At</p>
                    <p className="font-semibold text-foreground">
                      {new Date(selectedOrder.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                  <div className="bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-foreground/10">
                    <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-3">Order Items</p>
                    <div className="space-y-3">
                      {selectedOrder.orderItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center pb-3 border-b border-foreground/10 last:border-0 last:pb-0">
                          <div>
                            <span className="font-semibold text-foreground">{item.productName}</span>
                            <span className="text-xs text-foreground/60 ml-2">(SKU: {item.productSku})</span>
                            <span className="block text-sm text-foreground/70 mt-1">Qty: {item.quantity} × ${item.price.toFixed(2)}</span>
                          </div>
                          <span className="font-bold text-gold-400">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}


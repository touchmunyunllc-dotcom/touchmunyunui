import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { orderService, Order, OrderStatusTab, UserOrdersSummary } from '@/services/orderService';
import { notificationService } from '@/services/notificationService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { CartLineCustomizationTags } from '@/components/CartLineCustomizationTags';
import Image from 'next/image';
import { IMAGE_SIZES } from '@/lib/imageSizes';
import { SEO } from '@/components/SEO';

const PAGE_SIZE = 8;

const STATUS_TABS: { id: OrderStatusTab; label: string; countKey: keyof UserOrdersSummary }[] = [
  { id: 'all', label: 'All', countKey: 'totalCount' },
  { id: 'pending', label: 'Pending', countKey: 'pending' },
  { id: 'delivered', label: 'Delivered', countKey: 'delivered' },
  { id: 'cancelled', label: 'Cancelled', countKey: 'cancelled' },
];

const EMPTY_TAB_COPY: Record<OrderStatusTab, { title: string; description: string }> = {
  all: {
    title: 'No orders yet',
    description: 'Browse products and place your first order.',
  },
  pending: {
    title: 'No pending orders',
    description: 'Orders awaiting payment or confirmation will appear here.',
  },
  delivered: {
    title: 'No delivered orders',
    description: 'Completed deliveries will show up in this tab.',
  },
  cancelled: {
    title: 'No cancelled orders',
    description: 'Cancelled orders will appear here if any.',
  },
};

const inputClassName =
  'w-full sm:w-auto px-3 py-2 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-red-500/30 focus:border-red-500/40 bg-black/20 backdrop-blur-sm text-foreground text-sm transition-all';

const panelClassName =
  'bg-primary/80 backdrop-blur-xl rounded-2xl shadow-glass-lg border border-foreground/10';

function getStatusText(status: string | number | undefined): string {
  if (typeof status === 'number') {
    const statusMap = ['Pending', 'Paid', 'Packed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    return statusMap[status] || 'Pending';
  }
  return status || 'Pending';
}

function getStatusStyles(status: string | number | undefined): string {
  const statusStr = getStatusText(status);
  switch (statusStr) {
    case 'Delivered':
      return 'border-green-500/40 bg-green-500/10 text-green-400';
    case 'Shipped':
      return 'border-blue-500/40 bg-blue-500/10 text-blue-300';
    case 'Packed':
      return 'border-gold-500/40 bg-gold-500/10 text-gold-400';
    case 'Paid':
      return 'border-purple-500/40 bg-purple-500/10 text-purple-300';
    case 'Processing':
      return 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300';
    case 'Cancelled':
      return 'border-red-500/40 bg-red-600/10 text-red-400';
    default:
      return 'border-white/20 bg-white/5 text-foreground/70';
  }
}

function OrderThumbnails({ order }: { order: Order }) {
  const items = order.orderItems?.slice(0, 3) || [];
  if (items.length === 0) {
    return (
      <div className="h-10 w-10 rounded-lg border border-foreground/15 bg-black/20 shrink-0" />
    );
  }

  return (
    <div className="flex -space-x-2 shrink-0">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="relative h-10 w-10 rounded-lg border-2 border-black/40 overflow-hidden bg-black/30"
          style={{ zIndex: items.length - index }}
        >
          {item.product?.imageUrl ? (
            <Image
              src={item.product.imageUrl}
              alt=""
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-white/5" />
          )}
        </div>
      ))}
    </div>
  );
}

function OrderDetailPanel({ order, onOpenFull }: { order: Order; onOpenFull: () => void }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 p-5 border-b border-foreground/10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.14em] text-foreground/45">Order details</p>
            <h2 className="text-xl font-bold text-foreground truncate mt-1">
              #{order.orderCode || order.id.slice(0, 8)}
            </h2>
            <p className="text-sm text-foreground/60 mt-1">
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold border ${getStatusStyles(
              order.status
            )}`}
          >
            {getStatusText(order.status)}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-2xl font-bold text-gold-400">${order.totalAmount.toFixed(2)}</p>
          <button
            type="button"
            onClick={onOpenFull}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-all"
          >
            Full details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {order.trackingNumber && (
          <p className="text-xs text-foreground/55 mt-3 truncate">
            Tracking: <span className="text-foreground/80">{order.trackingNumber}</span>
          </p>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-3">
        {order.orderItems?.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-xl border border-foreground/10 bg-black/15 p-3"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-foreground/15">
              {item.product?.imageUrl ? (
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  fill
                  sizes={IMAGE_SIZES.orderThumb}
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-foreground truncate">
                {item.product?.name || 'Product'}
              </p>
              <p className="text-xs text-foreground/60 mt-0.5">
                Qty {item.quantity} · ${item.price.toFixed(2)}
              </p>
              <CartLineCustomizationTags line={item} />
            </div>
            <p className="text-sm font-bold text-gold-400 shrink-0">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summary, setSummary] = useState<UserOrdersSummary>({
    totalCount: 0,
    pending: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [activeTab, setActiveTab] = useState<OrderStatusTab>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    totalCount: 0,
    totalPages: 0,
  });

  const fetchSummary = useCallback(async () => {
    if (!isAuthenticated) return;

    if (appliedStartDate && appliedEndDate && new Date(appliedStartDate) > new Date(appliedEndDate)) {
      return;
    }

    try {
      setSummaryLoading(true);
      const result = await orderService.getUserOrdersSummary({
        startDate: appliedStartDate || undefined,
        endDate: appliedEndDate || undefined,
      });
      setSummary(result);
    } catch {
      notificationService.error('Failed to load order summary');
    } finally {
      setSummaryLoading(false);
    }
  }, [isAuthenticated, appliedStartDate, appliedEndDate]);

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return;

    if (appliedStartDate && appliedEndDate && new Date(appliedStartDate) > new Date(appliedEndDate)) {
      return;
    }

    try {
      setLoading(true);
      const result = await orderService.getUserOrdersPaginated({
        startDate: appliedStartDate || undefined,
        endDate: appliedEndDate || undefined,
        page: pagination.page,
        pageSize: pagination.pageSize,
        statusGroup: activeTab,
      });
      setOrders(result.orders);
      setPagination((prev) => ({
        ...prev,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
      }));
    } catch {
      notificationService.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [
    isAuthenticated,
    appliedStartDate,
    appliedEndDate,
    pagination.page,
    pagination.pageSize,
    activeTab,
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    void fetchSummary();
    void fetchOrders();
  }, [isAuthenticated, router, fetchSummary, fetchOrders]);

  useEffect(() => {
    if (orders.length === 0) {
      setSelectedOrderId(null);
      return;
    }
    if (!selectedOrderId || !orders.some((o) => o.id === selectedOrderId)) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orders, selectedOrderId]);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  );

  const handleTabChange = (tab: OrderStatusTab) => {
    setActiveTab(tab);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      notificationService.error('End date must be after start date');
      return;
    }
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const openOrder = (orderId: string) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      router.push(`/orders/${orderId}`);
      return;
    }
    setSelectedOrderId(orderId);
  };

  const rangeStart = pagination.totalCount === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const rangeEnd = Math.min(pagination.page * pagination.pageSize, pagination.totalCount);
  const activeTabCount = summary[STATUS_TABS.find((t) => t.id === activeTab)!.countKey];
  const emptyCopy = EMPTY_TAB_COPY[activeTab];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <SEO title="My Orders - Touch Munyun" noindex nofollow />
      <div className="bg-primary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Compact header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/40 mb-1">Account</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Orders</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                href="/profile"
                className="rounded-full border border-foreground/15 px-3 py-1 text-foreground/75 hover:text-red-400 hover:border-red-500/30 transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/products"
                className="rounded-full border border-foreground/15 px-3 py-1 text-foreground/75 hover:text-red-400 hover:border-red-500/30 transition-colors"
              >
                Shop
              </Link>
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className={`rounded-full px-3 py-1 border transition-colors ${
                  showFilters || appliedStartDate || appliedEndDate
                    ? 'border-red-500/40 bg-red-600/10 text-red-400'
                    : 'border-foreground/15 text-foreground/75 hover:border-red-500/30'
                }`}
              >
                Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <div className={`${panelClassName} p-4 mb-4 flex flex-col sm:flex-row sm:flex-wrap gap-3 items-end`}>
              <div className="flex-1 min-w-[140px]">
                <label htmlFor="startDate" className="block text-xs font-semibold text-foreground/70 mb-1">
                  From
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div className="flex-1 min-w-[140px]">
                <label htmlFor="endDate" className="block text-xs font-semibold text-foreground/70 mb-1">
                  To
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleFilterChange}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-2 rounded-lg border border-foreground/20 text-sm font-medium hover:bg-white/5"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Status summary tabs */}
          <div className={`${panelClassName} p-2 mb-4 overflow-x-auto`}>
            <div className="flex min-w-max gap-2" role="tablist" aria-label="Order status">
              {STATUS_TABS.map((tab) => {
                const count = summary[tab.countKey];
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleTabChange(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-red-600 text-white shadow-glow-red'
                        : 'text-foreground/75 hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-black/25 text-foreground/70'
                      } ${summaryLoading ? 'opacity-50' : ''}`}
                    >
                      {summaryLoading ? '…' : count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fixed-height dashboard — scroll happens inside panels, not the whole page */}
          <div
            className={`${panelClassName} overflow-hidden flex flex-col h-[min(72vh,calc(100svh-11rem))] lg:h-[min(680px,calc(100svh-12rem))]`}
          >
            {loading && orders.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : orders.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <EmptyState
                  variant="orders"
                  title={emptyCopy.title}
                  description={emptyCopy.description}
                  action={
                    activeTab === 'all'
                      ? {
                          label: 'Browse Products',
                          onClick: () => router.push('/products'),
                        }
                      : undefined
                  }
                />
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row flex-1 min-h-0">
                {/* Order list */}
                <div className="flex flex-col min-h-0 lg:w-[42%] lg:border-r border-foreground/10">
                  <div className="shrink-0 px-4 py-3 border-b border-foreground/10 flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
                      {STATUS_TABS.find((t) => t.id === activeTab)?.label ?? 'Orders'}
                    </p>
                    <p className="text-xs text-foreground/45">
                      {activeTabCount === 0
                        ? '0 orders'
                        : `${rangeStart}–${rangeEnd} of ${pagination.totalCount}`}
                    </p>
                  </div>

                  <div
                    className={`flex-1 min-h-0 overflow-y-auto divide-y divide-foreground/10 transition-opacity ${
                      loading ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {orders.map((order) => {
                      const isSelected = order.id === selectedOrderId;
                      const itemCount = order.orderItems?.length || 0;

                      return (
                        <button
                          key={order.id}
                          type="button"
                          onClick={() => openOrder(order.id)}
                          className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors hover:bg-white/5 ${
                            isSelected ? 'bg-red-600/10 border-l-2 border-l-red-500' : 'border-l-2 border-l-transparent'
                          }`}
                        >
                          <OrderThumbnails order={order} />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm text-foreground truncate">
                              #{order.orderCode || order.id.slice(0, 8)}
                            </p>
                            <p className="text-xs text-foreground/55 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                              · {itemCount} item{itemCount === 1 ? '' : 's'}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold border ${getStatusStyles(
                                order.status
                              )}`}
                            >
                              {getStatusText(order.status)}
                            </span>
                            <p className="text-sm font-bold text-gold-400 mt-1">
                              ${order.totalAmount.toFixed(2)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Compact pagination footer */}
                  {pagination.totalPages > 1 && (
                    <div className="shrink-0 px-4 py-3 border-t border-foreground/10 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        disabled={pagination.page <= 1}
                        onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                        className="px-3 py-1.5 rounded-lg border border-foreground/20 text-xs font-medium disabled:opacity-40 hover:bg-white/5"
                      >
                        Prev
                      </button>
                      <span className="text-xs text-foreground/55">
                        Page {pagination.page} / {pagination.totalPages}
                      </span>
                      <button
                        type="button"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                        className="px-3 py-1.5 rounded-lg border border-foreground/20 text-xs font-medium disabled:opacity-40 hover:bg-white/5"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>

                {/* Detail panel — desktop only */}
                <div className="hidden lg:flex flex-col flex-1 min-h-0 min-w-0">
                  {selectedOrder ? (
                    <OrderDetailPanel
                      order={selectedOrder}
                      onOpenFull={() => router.push(`/orders/${selectedOrder.id}`)}
                    />
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-foreground/45 text-sm">
                      Select an order
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-foreground/40 mt-3 lg:hidden">
            Tap an order to view full details
          </p>
        </div>
      </div>
    </Layout>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { SEO } from '@/components/SEO';
import {
  analyticsService,
  DashboardStats,
  OrdersSummary,
  RevenueStats,
  TopProduct,
  TimeSeriesData,
} from '@/services/analyticsService';
import { notificationService } from '@/services/notificationService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ChartCard } from '@/components/ChartCard';
import { Pagination } from '@/components/Pagination';
import { getOrderStatusTileConfig, ORDER_STATUS_DISPLAY_ORDER } from '@/utils/colorUtils';
import { adminSelectClassName, adminSelectOptionProps, adminGridWrapperClassName, adminGridScrollClassName, adminGridTableClassName, adminGridHeadClassName, adminGridHeadCellClassName, adminGridBodyClassName, adminGridRowClassName, adminGridCellClassName, adminGridCellMutedClassName, adminGridEmptyClassName } from '@/lib/adminFormStyles';
import { DashboardTab, parseDashboardTabFromHash, adminDashboardHref, rememberAdminReturnTab } from '@/lib/adminDashboard';

const EMPTY_STATS: DashboardStats = {
  totalOrders: 0,
  completedOrders: 0,
  pendingOrders: 0,
  totalRevenue: 0,
  averageOrderValue: 0,
  totalCustomers: 0,
  period: { startDate: '', endDate: '' },
};

const EMPTY_ORDERS_SUMMARY: OrdersSummary = {
  byStatus: [],
  period: { startDate: '', endDate: '' },
};

const ANALYTICS_TABS: DashboardTab[] = ['metrics', 'orders', 'products', 'revenue'];
type GroupBy = 'day' | 'month' | 'year';

interface DateFilters {
  startDate: string;
  endDate: string;
  groupBy: GroupBy;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function defaultDateFilters(): DateFilters {
  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - 1);
  return {
    startDate: formatLocalDate(start),
    endDate: formatLocalDate(end),
    groupBy: 'day',
  };
}

function paginateSlice<T>(items: T[], page: number, pageSize: number) {
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    totalCount,
    totalPages,
    page: safePage,
  };
}

export default function AdminDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>('metrics');
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(EMPTY_STATS);
  const [ordersSummary, setOrdersSummary] = useState<OrdersSummary>(EMPTY_ORDERS_SUMMARY);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<DateFilters>(defaultDateFilters);
  const [draftFilters, setDraftFilters] = useState<DateFilters>(defaultDateFilters);
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [revenuePage, setRevenuePage] = useState(1);
  const [revenuePageSize, setRevenuePageSize] = useState(10);
  const [productsPage, setProductsPage] = useState(1);
  const [productsPageSize, setProductsPageSize] = useState(10);
  const [actionsPage, setActionsPage] = useState(1);
  const [actionsPageSize, setActionsPageSize] = useState(6);
  const [selectedChart, setSelectedChart] = useState<{
    title: string;
    dataKey: string;
    color: string;
    accentGradient: string;
    type: 'line' | 'bar';
    formatValue?: (value: number) => string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncFromHash = () => {
      setActiveTab(parseDashboardTabFromHash(window.location.hash));
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const selectTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    const href = adminDashboardHref(tab);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', href);
    }
  };

  const applyPreset = (preset: string) => {
    const today = new Date();
    const start = new Date();

    switch (preset) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'last7':
        start.setDate(today.getDate() - 7);
        break;
      case 'last30':
        start.setDate(today.getDate() - 30);
        break;
      case 'last90':
        start.setDate(today.getDate() - 90);
        break;
      case 'thisMonth':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'thisYear':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        break;
      default:
        return;
    }

    const next: DateFilters = {
      startDate: formatLocalDate(start),
      endDate: formatLocalDate(today),
      groupBy: appliedFilters.groupBy,
    };
    setDraftFilters(next);
    setAppliedFilters(next);
    setShowDateFilters(false);
    setRevenuePage(1);
    setProductsPage(1);
  };

  const applyCustomFilters = () => {
    if (!draftFilters.startDate || !draftFilters.endDate) {
      notificationService.error('Please select both start and end dates.');
      return;
    }
    if (draftFilters.startDate > draftFilters.endDate) {
      notificationService.error('Start date must be before end date.');
      return;
    }
    setAppliedFilters({ ...draftFilters });
    setShowDateFilters(false);
    setRevenuePage(1);
    setProductsPage(1);
  };

  const fetchDashboardData = useCallback(async () => {
    setRefreshing(true);
    setLoadError(null);

    try {
      const { startDate, endDate, groupBy } = appliedFilters;
      const results = await Promise.allSettled([
        analyticsService.getDashboardStats(startDate, endDate),
        analyticsService.getOrdersSummary(startDate, endDate),
        analyticsService.getTopProducts(100, startDate, endDate),
        analyticsService.getTimeSeriesData(startDate, endDate, groupBy),
        analyticsService.getRevenue(startDate, endDate),
      ]);

      const [statsResult, summaryResult, productsResult, timeSeriesResult, revenueResult] = results;
      const errors: string[] = [];

      if (statsResult.status === 'fulfilled') {
        setDashboardStats(statsResult.value);
      } else {
        errors.push('summary metrics');
        setDashboardStats({
          ...EMPTY_STATS,
          period: { startDate, endDate },
        });
      }

      if (summaryResult.status === 'fulfilled') {
        setOrdersSummary(summaryResult.value);
      } else {
        errors.push('orders by status');
        setOrdersSummary({
          ...EMPTY_ORDERS_SUMMARY,
          period: { startDate, endDate },
        });
      }

      if (productsResult.status === 'fulfilled') {
        setTopProducts(productsResult.value);
      } else {
        errors.push('top products');
        setTopProducts([]);
      }

      if (timeSeriesResult.status === 'fulfilled') {
        setTimeSeriesData(timeSeriesResult.value);
      } else {
        errors.push('time-series charts');
        setTimeSeriesData([]);
      }

      if (revenueResult.status === 'fulfilled') {
        setRevenueStats(revenueResult.value);
      } else {
        errors.push('revenue breakdown');
        setRevenueStats(null);
      }

      if (errors.length > 0) {
        const message = `Could not load: ${errors.join(', ')}. Check that the API is running and you are logged in as admin.`;
        setLoadError(message);
        notificationService.error(message);
      }
    } finally {
      setRefreshing(false);
      setInitialLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchDashboardData();
  }, [authLoading, isAuthenticated, user?.id, user?.role, fetchDashboardData, router]);

  const revenueRows = useMemo(
    () => [...(revenueStats?.dailyRevenue ?? [])].sort((a, b) => a.date.localeCompare(b.date)),
    [revenueStats]
  );
  const pagedRevenue = useMemo(
    () => paginateSlice(revenueRows, revenuePage, revenuePageSize),
    [revenueRows, revenuePage, revenuePageSize]
  );
  const statusTiles = useMemo(() => {
    const byStatusMap = new Map(ordersSummary.byStatus.map((item) => [item.status, item]));
    const known = ORDER_STATUS_DISPLAY_ORDER.map((status) => ({
      status,
      count: byStatusMap.get(status)?.count ?? 0,
      totalAmount: byStatusMap.get(status)?.totalAmount ?? 0,
    }));
    const extras = ordersSummary.byStatus
      .filter((item) => !ORDER_STATUS_DISPLAY_ORDER.includes(item.status as (typeof ORDER_STATUS_DISPLAY_ORDER)[number]))
      .map((item) => ({
        status: item.status,
        count: item.count,
        totalAmount: item.totalAmount,
      }));
    return [...known, ...extras];
  }, [ordersSummary.byStatus]);
  const pagedProducts = useMemo(
    () => paginateSlice(topProducts, productsPage, productsPageSize),
    [topProducts, productsPage, productsPageSize]
  );

  const getChartData = () => {
    const normalizePoint = (item: TimeSeriesData | Record<string, unknown>) => ({
      date: String((item as TimeSeriesData).date ?? (item as Record<string, unknown>).Date ?? ''),
      totalOrders: Number((item as TimeSeriesData).totalOrders ?? (item as Record<string, unknown>).TotalOrders ?? 0),
      completedOrders: Number((item as TimeSeriesData).completedOrders ?? (item as Record<string, unknown>).CompletedOrders ?? 0),
      totalRevenue: Number((item as TimeSeriesData).totalRevenue ?? (item as Record<string, unknown>).TotalRevenue ?? 0),
      averageOrderValue: Number((item as TimeSeriesData).averageOrderValue ?? (item as Record<string, unknown>).AverageOrderValue ?? 0),
      totalCustomers: Number((item as TimeSeriesData).totalCustomers ?? (item as Record<string, unknown>).TotalCustomers ?? 0),
    });

    if (timeSeriesData.length > 0) {
      return timeSeriesData.map(normalizePoint);
    }

    if (dashboardStats.totalOrders > 0 || dashboardStats.totalRevenue > 0) {
      return [
        normalizePoint({
          date: appliedFilters.endDate,
          totalOrders: dashboardStats.totalOrders,
          completedOrders: dashboardStats.completedOrders,
          totalRevenue: dashboardStats.totalRevenue,
          averageOrderValue: dashboardStats.averageOrderValue,
          totalCustomers: dashboardStats.totalCustomers,
        }),
      ];
    }

    return [];
  };

  const adminCards = [
    {
      title: 'Products',
      description: 'Manage products, inventory, and pricing',
      href: '/admin/products',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Orders',
      description: 'View and manage customer orders',
      href: '/admin/orders',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Coupons',
      description: 'Create and manage discount coupons',
      href: '/admin/coupons',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Slideshow',
      description: 'Manage homepage hero slider images',
      href: '/admin/slideshow',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'from-pink-500 to-pink-600',
    },
    {
      title: 'Customers',
      description: 'View and manage registered users',
      href: '/admin/customers',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'from-indigo-500 to-indigo-600',
    },
  ];

  const pagedActions = useMemo(
    () => paginateSlice(adminCards, actionsPage, actionsPageSize),
    [actionsPage, actionsPageSize]
  );

  if (authLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const tabClass = (tab: DashboardTab) =>
    `shrink-0 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
      activeTab === tab
        ? 'border-button text-button'
        : 'border-transparent text-foreground/60 hover:text-foreground'
    }`;

  return (
    <>
      <SEO
        title="Admin Dashboard - TouchMunyun"
        description="Admin dashboard for managing TouchMunyun e-commerce platform"
        keywords="admin, dashboard, management, TouchMunyun"
      />
      <Layout>
        <div className="min-h-screen bg-primary py-6 sm:py-12">
          <div className="page-shell">
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
                  <p className="text-base md:text-lg text-foreground/70">
                    Welcome back, {user?.name}! Manage your store from here.
                  </p>
                </div>
              </div>

              <div className="mt-6 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto overscroll-x-contain">
                <div className="flex min-w-max sm:min-w-0 sm:flex-wrap border-b border-foreground/20 gap-x-1">
                <button type="button" className={tabClass('metrics')} onClick={() => selectTab('metrics')}>
                  Key Metrics
                </button>
                <button type="button" className={tabClass('orders')} onClick={() => selectTab('orders')}>
                  Orders by Status
                </button>
                <button type="button" className={tabClass('products')} onClick={() => selectTab('products')}>
                  Top Selling Products
                </button>
                <button type="button" className={tabClass('revenue')} onClick={() => selectTab('revenue')}>
                  Revenue by Day
                </button>
                <button type="button" className={tabClass('actions')} onClick={() => selectTab('actions')}>
                  Quick Actions
                </button>
                </div>
              </div>
            </div>

            {ANALYTICS_TABS.includes(activeTab) && (
              <>
                <div className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <p className="text-sm text-foreground/60">
                    Showing data for{' '}
                    <span className="font-medium text-foreground">
                      {appliedFilters.startDate} → {appliedFilters.endDate}
                    </span>
                    {refreshing && (
                      <span className="ml-2 inline-flex items-center gap-1 text-button">
                        <LoadingSpinner size="sm" />
                        Updating…
                      </span>
                    )}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex flex-wrap gap-2">
                      {[
                        ['today', 'Today'],
                        ['last7', 'Last 7 Days'],
                        ['last30', 'Last 30 Days'],
                        ['last90', 'Last 90 Days'],
                        ['thisYear', 'This Year'],
                      ].map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => applyPreset(key)}
                          className="px-3 py-2 text-sm border border-foreground/20 rounded-lg hover:bg-primary/80 transition-colors whitespace-nowrap text-foreground/70"
                        >
                          {label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setDraftFilters(appliedFilters);
                          setShowDateFilters((v) => !v);
                        }}
                        className={`px-3 py-2 text-sm border rounded-lg transition-colors whitespace-nowrap ${
                          showDateFilters
                            ? 'bg-button text-button-text border-button'
                            : 'border-foreground/20 hover:bg-primary/80 text-foreground/70'
                        }`}
                      >
                        Custom
                      </button>
                    </div>

                    <select
                      value={appliedFilters.groupBy}
                      onChange={(e) => {
                        const groupBy = e.target.value as GroupBy;
                        setAppliedFilters((prev) => ({ ...prev, groupBy }));
                        setDraftFilters((prev) => ({ ...prev, groupBy }));
                      }}
                      className={`${adminSelectClassName} !w-auto min-w-[7rem]`}
                    >
                      <option value="day" {...adminSelectOptionProps}>By Day</option>
                      <option value="month" {...adminSelectOptionProps}>By Month</option>
                      <option value="year" {...adminSelectOptionProps}>By Year</option>
                    </select>
                  </div>
                </div>

                {showDateFilters && (
                  <div className="mb-6 p-4 bg-primary/80 backdrop-blur-md rounded-lg shadow-glass border border-foreground/20">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-white mb-2">Start Date</label>
                        <input
                          type="date"
                          value={draftFilters.startDate}
                          onChange={(e) => setDraftFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                          className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-white mb-2">End Date</label>
                        <input
                          type="date"
                          value={draftFilters.endDate}
                          onChange={(e) => setDraftFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                          max={formatLocalDate(new Date())}
                          className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowDateFilters(false)}
                          className="px-4 py-2 border border-foreground/20 text-foreground rounded-lg hover:bg-primary/80 transition-colors whitespace-nowrap"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={applyCustomFilters}
                          className="px-4 py-2 bg-button text-button-text rounded-lg hover:opacity-90 transition-colors whitespace-nowrap"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {loadError && (
                  <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {loadError}
                  </div>
                )}

                {initialLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className={refreshing ? 'opacity-60 pointer-events-none' : ''}>
                    {activeTab === 'metrics' && (
                    <>
                    <div className="mb-8">
                      <div className="mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Key Metrics</h2>
                        <p className="text-foreground/70 text-sm mt-1">
                          Click any metric to view detailed analytics
                          {dashboardStats.totalOrders === 0 && (
                            <span className="block mt-1 text-foreground/50">
                              No orders in this range. Try &quot;Last 90 Days&quot; or &quot;This Year&quot;.
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="grid grid-auto-fill-md gap-5">
                        {[
                          {
                            label: 'Total Revenue',
                            value: `$${dashboardStats.totalRevenue.toFixed(2)}`,
                            color: 'from-gold-500 to-gold-600',
                            chart: {
                              title: 'Total Revenue Over Time',
                              dataKey: 'totalRevenue',
                              color: '#f59e0b',
                              accentGradient: 'from-gold-400 via-gold-500 to-gold-600',
                              type: 'bar' as const,
                              formatValue: (v: number) => `$${v.toFixed(2)}`,
                            },
                            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                          },
                          {
                            label: 'Total Orders',
                            value: String(dashboardStats.totalOrders),
                            color: 'from-blue-500 to-blue-600',
                            chart: {
                              title: 'Total Orders Over Time',
                              dataKey: 'totalOrders',
                              color: '#3b82f6',
                              accentGradient: 'from-blue-400 via-blue-500 to-blue-600',
                              type: 'line' as const,
                            },
                            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
                          },
                          {
                            label: 'Avg Order Value',
                            value: `$${dashboardStats.averageOrderValue.toFixed(2)}`,
                            color: 'from-emerald-500 to-emerald-600',
                            chart: {
                              title: 'Average Order Value Over Time',
                              dataKey: 'averageOrderValue',
                              color: '#10b981',
                              accentGradient: 'from-emerald-400 via-emerald-500 to-emerald-600',
                              type: 'line' as const,
                              formatValue: (v: number) => `$${v.toFixed(2)}`,
                            },
                            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                          },
                          {
                            label: 'Completed',
                            value: String(dashboardStats.completedOrders),
                            color: 'from-green-500 to-green-600',
                            chart: {
                              title: 'Completed Orders Over Time',
                              dataKey: 'completedOrders',
                              color: '#22c55e',
                              accentGradient: 'from-green-400 via-green-500 to-green-600',
                              type: 'line' as const,
                            },
                            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                          },
                          {
                            label: 'Customers',
                            value: String(dashboardStats.totalCustomers),
                            color: 'from-indigo-500 to-indigo-600',
                            chart: {
                              title: 'Total Customers Over Time',
                              dataKey: 'totalCustomers',
                              color: '#6366f1',
                              accentGradient: 'from-indigo-400 via-indigo-500 to-indigo-600',
                              type: 'bar' as const,
                            },
                            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
                          },
                        ].map((metric) => (
                          <div
                            key={metric.label}
                            className="group relative bg-gray-900 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-800 cursor-pointer"
                            onClick={() => setSelectedChart(metric.chart)}
                          >
                            <div className={`bg-gradient-to-br ${metric.color} p-7 sm:p-8 text-white relative overflow-hidden min-h-[168px]`}>
                              <div className="relative z-10">
                                <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm inline-flex mb-4">
                                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={metric.icon} />
                                  </svg>
                                </div>
                                <p className="text-white/90 text-xs font-bold mb-1 uppercase tracking-wider">{metric.label}</p>
                                <p className="text-2xl sm:text-3xl font-bold">{metric.value}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    </>
                    )}

                    {activeTab === 'orders' && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Orders by Status</h2>
                          <p className="text-foreground/70 text-sm mt-1">Click a status to view matching orders</p>
                        </div>
                        <Link href="/admin/orders" onClick={() => rememberAdminReturnTab('orders')} className="text-button hover:text-button-200 font-medium text-sm flex items-center gap-1">
                          View All
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                      <div className="grid grid-auto-fill-md gap-4">
                        {statusTiles.map((statusItem) => {
                          const tile = getOrderStatusTileConfig(statusItem.status);
                          return (
                            <div
                              key={statusItem.status}
                              className="group relative bg-gray-900 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-800 cursor-pointer"
                              onClick={() => {
                                rememberAdminReturnTab('orders');
                                router.push(`/admin/orders?status=${encodeURIComponent(statusItem.status)}`);
                              }}
                            >
                              <div className={`bg-gradient-to-br ${tile.gradient} p-6 text-white relative overflow-hidden min-h-[168px]`}>
                                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                                <div className="absolute -right-2 -bottom-8 h-20 w-20 rounded-full bg-white/5" />
                                <div className="relative z-10">
                                  <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm inline-flex mb-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tile.icon} />
                                    </svg>
                                  </div>
                                  <p className="text-white/90 text-xs font-bold mb-1 uppercase tracking-wider">{statusItem.status}</p>
                                  <p className="text-2xl sm:text-3xl font-bold">{statusItem.count}</p>
                                  <p className="text-white/80 text-sm font-medium mt-1">
                                    ${statusItem.totalAmount.toFixed(2)} revenue
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    )}

                    {activeTab === 'products' && (
                    <div className="mb-8">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                        <div className="min-w-0">
                          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Top Selling Products</h2>
                          <p className="text-foreground/70 text-sm mt-1">Best performing products this period</p>
                        </div>
                        <Link href="/admin/products" onClick={() => rememberAdminReturnTab('products')} className="shrink-0 text-button hover:text-button-200 font-medium text-sm flex items-center gap-1">
                          Manage Products
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                      {topProducts.length === 0 ? (
                        <div className={adminGridEmptyClassName}>
                          No product sales in the selected period.
                        </div>
                      ) : (
                        <>
                          <div className="md:hidden space-y-3">
                            {pagedProducts.items.map((product, index) => {
                              const rank = (pagedProducts.page - 1) * productsPageSize + index + 1;
                              return (
                                <div
                                  key={product.productId}
                                  className="rounded-xl border border-gray-800 bg-gray-900 p-4"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <span className="text-xs font-semibold text-foreground/60">#{rank}</span>
                                    <span className="text-base font-bold text-button tabular-nums">
                                      ${product.totalRevenue.toFixed(2)}
                                    </span>
                                  </div>
                                  <h3 className="font-semibold text-foreground mt-1 line-clamp-2">{product.productName}</h3>
                                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                                    <span className="text-gray-300 tabular-nums">${product.price.toFixed(2)}</span>
                                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {product.totalQuantitySold} units
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className={`hidden md:block ${adminGridWrapperClassName}`}>
                            <div className={adminGridScrollClassName}>
                              <table className={adminGridTableClassName}>
                                <thead className={adminGridHeadClassName}>
                                  <tr>
                                    <th className={`${adminGridHeadCellClassName} w-20`}>Rank</th>
                                    <th className={adminGridHeadCellClassName}>Product</th>
                                    <th className={`${adminGridHeadCellClassName} w-28 text-right`}>Price</th>
                                    <th className={`${adminGridHeadCellClassName} w-32 text-center`}>Sold</th>
                                    <th className={`${adminGridHeadCellClassName} w-36 text-right`}>Revenue</th>
                                  </tr>
                                </thead>
                                <tbody className={adminGridBodyClassName}>
                                  {pagedProducts.items.map((product, index) => {
                                    const rank = (pagedProducts.page - 1) * productsPageSize + index + 1;
                                    return (
                                      <tr key={product.productId} className={adminGridRowClassName}>
                                        <td className={`${adminGridCellClassName} whitespace-nowrap text-foreground/70 font-semibold`}>#{rank}</td>
                                        <td className={`${adminGridCellClassName} font-semibold truncate`}>{product.productName}</td>
                                        <td className={`${adminGridCellMutedClassName} whitespace-nowrap text-right`}>${product.price.toFixed(2)}</td>
                                        <td className={`${adminGridCellClassName} whitespace-nowrap text-center`}>
                                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {product.totalQuantitySold} units
                                          </span>
                                        </td>
                                        <td className={`${adminGridCellClassName} whitespace-nowrap text-right font-bold text-button`}>${product.totalRevenue.toFixed(2)}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          <Pagination
                            page={pagedProducts.page}
                            pageSize={productsPageSize}
                            totalCount={pagedProducts.totalCount}
                            totalPages={pagedProducts.totalPages}
                            onPageChange={setProductsPage}
                            onPageSizeChange={(size) => {
                              setProductsPageSize(size);
                              setProductsPage(1);
                            }}
                            itemLabel="products"
                          />
                        </>
                      )}
                    </div>
                    )}

                    {activeTab === 'revenue' && (
                    <div className="mb-8">
                      <div className="mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Revenue by Day</h2>
                        <p className="text-foreground/70 text-sm mt-1">Daily order count and revenue for the selected period</p>
                      </div>
                      {revenueRows.length === 0 ? (
                        <div className={adminGridEmptyClassName}>
                          No paid revenue in the selected date range.
                        </div>
                      ) : (
                        <>
                          <div className="md:hidden space-y-2">
                            {pagedRevenue.items.map((row) => (
                              <div
                                key={row.date}
                                className="flex items-center justify-between gap-3 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-foreground">
                                    {row.date ? row.date.slice(0, 10) : '—'}
                                  </p>
                                  <p className="text-xs text-foreground/60 tabular-nums">{row.orderCount} orders</p>
                                </div>
                                <span className="shrink-0 text-base font-bold text-button tabular-nums">
                                  ${row.revenue.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className={`hidden md:block ${adminGridWrapperClassName}`}>
                            <div className={adminGridScrollClassName}>
                              <table className={adminGridTableClassName}>
                                <thead className={adminGridHeadClassName}>
                                  <tr>
                                    <th className={`${adminGridHeadCellClassName} w-40`}>Date</th>
                                    <th className={`${adminGridHeadCellClassName} w-32 text-right`}>Orders</th>
                                    <th className={`${adminGridHeadCellClassName} w-36 text-right`}>Revenue</th>
                                  </tr>
                                </thead>
                                <tbody className={adminGridBodyClassName}>
                                  {pagedRevenue.items.map((row) => (
                                    <tr key={row.date} className={adminGridRowClassName}>
                                      <td className={`${adminGridCellClassName} whitespace-nowrap`}>
                                        {row.date ? row.date.slice(0, 10) : '—'}
                                      </td>
                                      <td className={`${adminGridCellClassName} text-right tabular-nums`}>{row.orderCount}</td>
                                      <td className={`${adminGridCellClassName} text-right tabular-nums text-button font-medium`}>
                                        ${row.revenue.toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          <Pagination
                            page={pagedRevenue.page}
                            pageSize={revenuePageSize}
                            totalCount={pagedRevenue.totalCount}
                            totalPages={pagedRevenue.totalPages}
                            onPageChange={setRevenuePage}
                            onPageSizeChange={(size) => {
                              setRevenuePageSize(size);
                              setRevenuePage(1);
                            }}
                            itemLabel="days"
                          />
                        </>
                      )}
                    </div>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === 'actions' && (
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Quick Actions</h2>
                <div className="grid grid-auto-fill-md gap-4">
                  {pagedActions.items.map((card) => (
                    <Link
                      key={card.href}
                      href={card.href}
                      onClick={() => rememberAdminReturnTab('actions')}
                      className="group relative bg-gray-900 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-800"
                    >
                      <div className={`bg-gradient-to-br ${card.color} p-6 text-white relative overflow-hidden`}>
                        <div className="relative z-10">
                          <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm inline-flex mb-4">{card.icon}</div>
                          <h3 className="text-lg font-bold mb-1">{card.title}</h3>
                          <p className="text-white/90 text-xs leading-relaxed">{card.description}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Pagination
                  page={pagedActions.page}
                  pageSize={actionsPageSize}
                  totalCount={pagedActions.totalCount}
                  totalPages={pagedActions.totalPages}
                  onPageChange={setActionsPage}
                  onPageSizeChange={(size) => {
                    setActionsPageSize(size);
                    setActionsPage(1);
                  }}
                  itemLabel="actions"
                />
              </div>
            )}
          </div>
        </div>

        {selectedChart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedChart(null)}>
            <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className={`h-1.5 bg-gradient-to-r ${selectedChart.accentGradient}`} />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-foreground">{selectedChart.title}</h2>
                  <button type="button" onClick={() => setSelectedChart(null)} className="text-gray-400 hover:text-gray-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {getChartData().length > 0 ? (
                  <ChartCard
                    title={selectedChart.title}
                    data={getChartData()}
                    dataKey={selectedChart.dataKey}
                    color={selectedChart.color}
                    accentGradient={selectedChart.accentGradient}
                    type={selectedChart.type}
                    formatValue={selectedChart.formatValue}
                    showTitle={false}
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-foreground/60 text-lg">No data available for the selected date range.</p>
                    <p className="text-foreground/50 text-sm mt-2">Try adjusting the date range or grouping option.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}

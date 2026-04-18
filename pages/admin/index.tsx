import { useEffect, useState } from 'react';
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
import { getMetricColor, getStatusColor } from '@/utils/colorUtils';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [ordersSummary, setOrdersSummary] = useState<OrdersSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [groupBy, setGroupBy] = useState<'day' | 'month' | 'year'>('day');
  const [showDateFilters, setShowDateFilters] = useState(false);

  const applyDatePreset = (preset: string) => {
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
    
    setDateRange({
      startDate: start.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    });
    setShowDateFilters(false);
  };
  const [selectedChart, setSelectedChart] = useState<{
    title: string;
    dataKey: string;
    color: string;
    type: 'line' | 'bar';
    formatValue?: (value: number) => string;
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, user, router, dateRange, groupBy]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [stats, summary, products, timeSeries, revenue] = await Promise.all([
        analyticsService.getDashboardStats(dateRange.startDate, dateRange.endDate),
        analyticsService.getOrdersSummary(dateRange.startDate, dateRange.endDate),
        analyticsService.getTopProducts(10, dateRange.startDate, dateRange.endDate),
        analyticsService.getTimeSeriesData(dateRange.startDate, dateRange.endDate, groupBy),
        analyticsService.getRevenue(dateRange.startDate, dateRange.endDate),
      ]);

      setDashboardStats(stats);
      setOrdersSummary(summary);
      setTopProducts(products);
      setTimeSeriesData(timeSeries);
      setRevenueStats(revenue);
      
      // Debug: Log time series data
      console.log('Time Series Data:', timeSeries);
    } catch (error) {
      notificationService.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

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

  return (
    <>
      <SEO
        title="Admin Dashboard - TouchMunyun"
        description="Admin dashboard for managing TouchMunyun e-commerce platform"
        keywords="admin, dashboard, management, TouchMunyun"
      />
      <Layout>
        <div className="min-h-screen bg-primary py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    Admin Dashboard
                  </h1>
                  <p className="text-base md:text-lg text-foreground/70">
                    Welcome back, {user?.name}! Manage your store from here.
                  </p>
                </div>
                
                {/* Date Filters - Responsive */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Quick Presets */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => applyDatePreset('today')}
                      className="px-3 py-2 text-sm border border-foreground/20 rounded-lg hover:bg-primary/80 transition-colors whitespace-nowrap text-foreground/70"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => applyDatePreset('last7')}
                      className="px-3 py-2 text-sm border border-foreground/20 rounded-lg hover:bg-primary/80 transition-colors whitespace-nowrap text-foreground/70"
                    >
                      Last 7 Days
                    </button>
                    <button
                      onClick={() => applyDatePreset('last30')}
                      className="px-3 py-2 text-sm border border-foreground/20 rounded-lg hover:bg-primary/80 transition-colors whitespace-nowrap text-foreground/70"
                    >
                      Last 30 Days
                    </button>
                    <button
                      onClick={() => setShowDateFilters(!showDateFilters)}
                      className={`px-3 py-2 text-sm border rounded-lg transition-colors whitespace-nowrap ${
                        showDateFilters
                          ? 'bg-button text-button-text border-button'
                          : 'border-foreground/20 hover:bg-primary/80 text-foreground/70'
                      }`}
                    >
                      {showDateFilters ? 'Hide' : 'Custom'}
                    </button>
                  </div>
                  
                  {/* Group By Selector */}
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as 'day' | 'month' | 'year')}
                    className="px-3 py-2 text-sm border border-foreground/20 rounded-lg focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50"
                  >
                    <option value="day">By Day</option>
                    <option value="month">By Month</option>
                    <option value="year">By Year</option>
                  </select>
                </div>
              </div>

              {/* Custom Date Range - Collapsible */}
              {showDateFilters && (
                <div className="mt-4 p-4 bg-primary/80 backdrop-blur-md rounded-lg shadow-glass border border-foreground/20">
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground"
                      />
                    </div>
                    <button
                      onClick={() => setShowDateFilters(false)}
                      className="px-4 py-2 bg-primary/60 text-foreground rounded-lg hover:bg-primary/80 transition-colors whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {/* Key Metrics - Modern Cards with Gradients */}
                {dashboardStats && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Key Metrics</h2>
                        <p className="text-foreground/70 text-sm mt-1">Click any metric to view detailed analytics</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                      {/* Total Revenue - Primary Metric */}
                      {(() => {
                        const metricColors = getMetricColor('revenue');
                        return (
                          <div 
                            className={`group relative bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-6 border-2 ${metricColors.border} cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 overflow-hidden ${metricColors.hoverGlow}`}
                            onClick={() => setSelectedChart({
                              title: 'Total Revenue Over Time',
                              dataKey: 'totalRevenue',
                              color: '#10b981',
                              type: 'bar',
                              formatValue: (value) => `$${value.toFixed(2)}`
                            })}
                          >
                            {/* Premium gradient accent bar */}
                            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${metricColors.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-500`} />
                            
                            {/* Subtle glow effect */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${metricColors.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`} />
                            
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-4">
                                <div className={`${metricColors.iconBg} rounded-xl p-3 shadow-glass-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                              </div>
                              <p className={`${metricColors.text} text-sm font-semibold mb-1 uppercase tracking-wide`}>Total Revenue</p>
                              <p className="text-3xl font-bold text-foreground group-hover:text-button transition-colors">
                                ${dashboardStats.totalRevenue.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Total Orders */}
                      {(() => {
                        const metricColors = getMetricColor('orders');
                        return (
                          <div 
                            className={`group relative bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-6 border-2 ${metricColors.border} cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 overflow-hidden ${metricColors.hoverGlow}`}
                            onClick={() => setSelectedChart({
                              title: 'Total Orders Over Time',
                              dataKey: 'totalOrders',
                              color: '#3b82f6',
                              type: 'line'
                            })}
                          >
                            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${metricColors.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-500`} />
                            <div className={`absolute inset-0 bg-gradient-to-br ${metricColors.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`} />
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-4">
                                <div className={`${metricColors.iconBg} rounded-xl p-3 shadow-glass-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                </div>
                              </div>
                              <p className={`${metricColors.text} text-sm font-semibold mb-1 uppercase tracking-wide`}>Total Orders</p>
                              <p className="text-3xl font-bold text-foreground group-hover:text-button transition-colors">
                                {dashboardStats.totalOrders}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Average Order Value */}
                      {(() => {
                        const metricColors = getMetricColor('revenue');
                        return (
                          <div 
                            className={`group relative bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-6 border-2 ${metricColors.border} cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 overflow-hidden ${metricColors.hoverGlow}`}
                            onClick={() => setSelectedChart({
                              title: 'Average Order Value Over Time',
                              dataKey: 'averageOrderValue',
                              color: '#10b981',
                              type: 'line',
                              formatValue: (value) => `$${value.toFixed(2)}`
                            })}
                          >
                            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${metricColors.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-500`} />
                            <div className={`absolute inset-0 bg-gradient-to-br ${metricColors.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`} />
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-4">
                                <div className={`${metricColors.iconBg} rounded-xl p-3 shadow-glass-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                  </svg>
                                </div>
                              </div>
                              <p className={`${metricColors.text} text-sm font-semibold mb-1 uppercase tracking-wide`}>Avg Order Value</p>
                              <p className="text-3xl font-bold text-foreground group-hover:text-button transition-colors">
                                ${dashboardStats.averageOrderValue.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Completed Orders */}
                      {(() => {
                        const metricColors = getMetricColor('orders');
                        return (
                          <div 
                            className={`group relative bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-6 border-2 ${metricColors.border} cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 overflow-hidden ${metricColors.hoverGlow}`}
                            onClick={() => setSelectedChart({
                              title: 'Completed Orders Over Time',
                              dataKey: 'completedOrders',
                              color: '#3b82f6',
                              type: 'line'
                            })}
                          >
                            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${metricColors.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-500`} />
                            <div className={`absolute inset-0 bg-gradient-to-br ${metricColors.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`} />
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-4">
                                <div className={`${metricColors.iconBg} rounded-xl p-3 shadow-glass-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                              </div>
                              <p className={`${metricColors.text} text-sm font-semibold mb-1 uppercase tracking-wide`}>Completed</p>
                              <p className="text-3xl font-bold text-foreground group-hover:text-button transition-colors">
                                {dashboardStats.completedOrders}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Total Customers */}
                      {(() => {
                        const metricColors = getMetricColor('customers');
                        return (
                          <div 
                            className={`group relative bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-6 border-2 ${metricColors.border} cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 overflow-hidden ${metricColors.hoverGlow}`}
                            onClick={() => setSelectedChart({
                              title: 'Total Customers Over Time',
                              dataKey: 'totalCustomers',
                              color: '#8b5cf6',
                              type: 'bar'
                            })}
                          >
                            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${metricColors.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-500`} />
                            <div className={`absolute inset-0 bg-gradient-to-br ${metricColors.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`} />
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-4">
                                <div className={`${metricColors.iconBg} rounded-xl p-3 shadow-glass-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                </div>
                              </div>
                              <p className={`${metricColors.text} text-sm font-semibold mb-1 uppercase tracking-wide`}>Customers</p>
                              <p className="text-3xl font-bold text-foreground group-hover:text-button transition-colors">
                                {dashboardStats.totalCustomers}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Paid revenue by day (admin analytics API) */}
                {revenueStats && revenueStats.dailyRevenue.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Revenue by day</h2>
                        <p className="text-foreground/70 text-sm mt-1">
                          From <code className="text-xs bg-primary/40 px-1 rounded">/admin/analytics/revenue</code>{' '}
                          (paid orders in range)
                        </p>
                      </div>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-foreground/20 bg-primary/60 backdrop-blur-md">
                      <table className="min-w-full text-sm text-foreground">
                        <thead>
                          <tr className="border-b border-foreground/20 text-left text-foreground/70">
                            <th className="px-4 py-3 font-semibold">Date</th>
                            <th className="px-4 py-3 font-semibold text-right">Orders</th>
                            <th className="px-4 py-3 font-semibold text-right">Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {revenueStats.dailyRevenue.slice(-31).map((row) => (
                            <tr key={row.date} className="border-b border-foreground/10 last:border-0">
                              <td className="px-4 py-2 whitespace-nowrap">
                                {row.date ? row.date.slice(0, 10) : '—'}
                              </td>
                              <td className="px-4 py-2 text-right tabular-nums">{row.orderCount}</td>
                              <td className="px-4 py-2 text-right tabular-nums text-button font-medium">
                                ${row.revenue.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Orders by Status - Modern Cards */}
                {ordersSummary && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Orders by Status</h2>
                        <p className="text-foreground/70 text-sm mt-1">Click to view orders filtered by status</p>
                      </div>
                      <Link
                        href="/admin/orders"
                        className="text-primary-600 hover:text-primary-800 font-medium text-sm flex items-center gap-1"
                      >
                        View All
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {ordersSummary.byStatus.map((statusItem) => {
                        const statusColors = getStatusColor(statusItem.status);
                        
                        return (
                          <div
                            key={statusItem.status}
                            className={`group relative bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-6 border-2 ${statusColors.border} cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 overflow-hidden ${statusColors.hoverGlow}`}
                            onClick={() => router.push(`/admin/orders?status=${encodeURIComponent(statusItem.status)}`)}
                          >
                            {/* Premium gradient accent bar */}
                            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${statusColors.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-500`} />
                            
                            {/* Subtle glow effect */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${statusColors.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`} />
                            
                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-3">
                                <div className={`${statusColors.iconBg} rounded-xl p-2.5 shadow-glass-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                              </div>
                              <p className={`${statusColors.text} text-xs font-bold mb-2 uppercase tracking-wider`}>
                                {statusItem.status}
                              </p>
                              <p className="text-3xl font-bold text-foreground group-hover:text-button transition-colors mb-1">
                                {statusItem.count}
                              </p>
                              <p className="text-foreground/60 text-sm font-medium">
                                ${statusItem.totalAmount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {ordersSummary.byStatus.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-400 bg-gray-900 rounded-xl border-2 border-dashed border-gray-800">
                          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="font-medium">No orders found</p>
                          <p className="text-sm">for the selected period</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Top Products - Modern Table */}
                {topProducts.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Top Selling Products</h2>
                        <p className="text-gray-500 text-sm mt-1">Best performing products this period</p>
                      </div>
                      <Link
                        href="/admin/products"
                        className="text-primary-600 hover:text-primary-800 font-medium text-sm flex items-center gap-1"
                      >
                        Manage Products
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                    <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-800">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Rank
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Product Name
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Price
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Sold
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Revenue
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-gray-900 divide-y divide-gray-800">
                            {topProducts.map((product, index) => (
                              <tr key={product.productId} className="hover:bg-gray-800 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {index < 3 ? (
                                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                        index === 1 ? 'bg-gray-800 text-gray-300' :
                                        'bg-orange-100 text-orange-800'
                                      }`}>
                                        {index + 1}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 font-semibold">#{index + 1}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-semibold text-primary-500">
                                    {product.productName}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-medium text-gray-300">
                                    ${product.price.toFixed(2)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {product.totalQuantitySold} units
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-bold text-primary-500">
                                    ${product.totalRevenue.toFixed(2)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Quick Actions - Modern Grid */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-500 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {adminCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="group relative bg-gray-900 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-800"
                  >
                    <div className={`bg-gradient-to-br ${card.color} p-6 text-white relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                            {card.icon}
                          </div>
                          <svg
                            className="w-5 h-5 transform group-hover:translate-x-1 transition-transform opacity-80"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold mb-1">{card.title}</h3>
                        <p className="text-white/90 text-xs leading-relaxed">{card.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Modal */}
        {selectedChart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedChart(null)}>
            <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-800" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-primary-500">{selectedChart.title}</h2>
                <button
                  onClick={() => setSelectedChart(null)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {timeSeriesData.length > 0 ? (
                <ChartCard
                  title={selectedChart.title}
                  data={timeSeriesData.map(item => ({
                    date: item.date,
                    totalOrders: item.totalOrders,
                    completedOrders: item.completedOrders,
                    totalRevenue: item.totalRevenue,
                    averageOrderValue: item.averageOrderValue,
                    totalCustomers: item.totalCustomers,
                  }))}
                  dataKey={selectedChart.dataKey}
                  color={selectedChart.color}
                  type={selectedChart.type}
                  formatValue={selectedChart.formatValue}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No data available for the selected date range.</p>
                  <p className="text-gray-400 text-sm mt-2">Try adjusting the date range or grouping option.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}


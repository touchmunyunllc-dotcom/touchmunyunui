/**
 * Premium Context-Based Color Utilities
 * Provides subtle, elegant color mapping for different contexts
 * Uses TouchMunyun theme with refined accent colors
 */

export type ColorContext = 
  | 'status' 
  | 'collection' 
  | 'metric' 
  | 'button' 
  | 'badge';

/**
 * Get status-based colors for orders
 * Icons.com style: Red, Grey, Gold context-based colors
 */
export const getStatusColor = (status: string) => {
  const statusMap: Record<string, {
    gradient: string;
    bg: string;
    text: string;
    border: string;
    iconBg: string;
    hoverGlow: string;
  }> = {
    'Pending': {
      gradient: 'from-gold-500 to-gold-600',
      bg: 'bg-gold-500/20',
      text: 'text-gold-400',
      border: 'border-gold-500/30',
      iconBg: 'bg-gold-600',
      hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(217,119,6,0.4)]',
    },
    'Paid': {
      gradient: 'from-red-600 to-red-700',
      bg: 'bg-red-600/20',
      text: 'text-red-400',
      border: 'border-red-600/30',
      iconBg: 'bg-red-600',
      hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]',
    },
    'Packed': {
      gradient: 'from-grey-500 to-grey-600',
      bg: 'bg-grey-500/20',
      text: 'text-grey-300',
      border: 'border-grey-500/30',
      iconBg: 'bg-grey-500',
      hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(107,114,128,0.3)]',
    },
    'Processing': {
      gradient: 'from-red-500 to-red-600',
      bg: 'bg-red-500/20',
      text: 'text-red-300',
      border: 'border-red-500/30',
      iconBg: 'bg-red-500',
      hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]',
    },
    'Shipped': {
      gradient: 'from-gold-600 to-gold-700',
      bg: 'bg-gold-600/20',
      text: 'text-gold-300',
      border: 'border-gold-600/30',
      iconBg: 'bg-gold-600',
      hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(217,119,6,0.4)]',
    },
    'Delivered': {
      gradient: 'from-red-600 to-red-800',
      bg: 'bg-red-600/20',
      text: 'text-red-300',
      border: 'border-red-600/30',
      iconBg: 'bg-red-600',
      hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]',
    },
    'Cancelled': {
      gradient: 'from-grey-600 to-grey-700',
      bg: 'bg-grey-600/20',
      text: 'text-grey-400',
      border: 'border-grey-600/30',
      iconBg: 'bg-grey-600',
      hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(75,85,99,0.3)]',
    },
  };

  const defaultColor = {
    gradient: 'from-grey-500 to-grey-600',
    bg: 'bg-grey-500/20',
    text: 'text-grey-300',
    border: 'border-grey-500/30',
    iconBg: 'bg-grey-500',
    hoverGlow: '',
  };

  return statusMap[status] || defaultColor;
};

/** Workflow order for dashboard status tiles. */
export const ORDER_STATUS_DISPLAY_ORDER = [
  'Pending',
  'Paid',
  'Packed',
  'Processing',
  'Shipped',
  'Delivered',
] as const;

/** Distinct gradient + icon per status for dashboard tiles (matches Key Metrics style). */
export const getOrderStatusTileConfig = (status: string) => {
  const tileMap: Record<string, { gradient: string; icon: string }> = {
    pending: {
      gradient: 'from-amber-500 to-orange-600',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    paid: {
      gradient: 'from-blue-500 to-blue-600',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    packed: {
      gradient: 'from-indigo-500 to-indigo-600',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
    processing: {
      gradient: 'from-purple-500 to-purple-600',
      icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    },
    shipped: {
      gradient: 'from-cyan-500 to-cyan-600',
      icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
    },
    delivered: {
      gradient: 'from-green-500 to-green-600',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    cancelled: {
      gradient: 'from-grey-600 to-grey-700',
      icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  };

  const defaultTile = {
    gradient: 'from-grey-600 to-grey-700',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  };

  const key = status?.trim().toLowerCase() || '';
  return tileMap[key] || defaultTile;
};

/**
 * Get collection-based colors
 * Icons.com style: Red, Grey, Gold context-based
 */
export const getCollectionColor = (collectionTitle: string) => {
  if (collectionTitle.includes('SUMMER') || collectionTitle.includes('summer')) {
    return {
      gradient: 'from-gold-500 to-gold-600',
      bg: 'bg-gold-500/10',
      text: 'text-gold-400',
      border: 'border-gold-500/20',
    };
  }
  if (collectionTitle.includes('NEW ARRIVALS') || collectionTitle.includes('new')) {
    return {
      gradient: 'from-red-600 to-red-700',
      bg: 'bg-red-600/10',
      text: 'text-red-400',
      border: 'border-red-600/20',
    };
  }
  if (collectionTitle.includes('BEST SELLERS') || collectionTitle.includes('best')) {
    return {
      gradient: 'from-gold-600 to-gold-700',
      bg: 'bg-gold-600/10',
      text: 'text-gold-300',
      border: 'border-gold-600/20',
    };
  }
  if (collectionTitle.includes('COUPON') || collectionTitle.includes('OFF')) {
    return {
      gradient: 'from-gold-500 to-gold-600',
      bg: 'bg-gold-500/10',
      text: 'text-gold-400',
      border: 'border-gold-500/20',
    };
  }
  
  return {
    gradient: 'from-red-600 to-red-700',
    bg: 'bg-red-600/10',
    text: 'text-red-400',
    border: 'border-red-600/20',
  };
};

/**
 * Get metric-based colors for admin dashboard
 * Icons.com style: Red, Grey, Gold context-based
 */
export const getMetricColor = (metricType: string) => {
  const metricMap: Record<string, {
    gradient: string;
    bg: string;
    text: string;
    border: string;
    iconBg: string;
    hoverGlow: string;
  }> = {
    'revenue': {
      gradient: 'from-gold-600 to-gold-700',
      bg: 'bg-gold-600/20',
      text: 'text-gold-300',
      border: 'border-gold-600/30',
      iconBg: 'bg-gold-600',
      hoverGlow: 'group-hover:shadow-[0_0_30px_rgba(217,119,6,0.5)]',
    },
    'orders': {
      gradient: 'from-red-600 to-red-700',
      bg: 'bg-red-600/20',
      text: 'text-red-300',
      border: 'border-red-600/30',
      iconBg: 'bg-red-600',
      hoverGlow: 'group-hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]',
    },
    'customers': {
      gradient: 'from-grey-500 to-grey-600',
      bg: 'bg-grey-500/20',
      text: 'text-grey-300',
      border: 'border-grey-500/30',
      iconBg: 'bg-grey-500',
      hoverGlow: 'group-hover:shadow-[0_0_30px_rgba(107,114,128,0.4)]',
    },
    'products': {
      gradient: 'from-red-500 to-red-600',
      bg: 'bg-red-500/20',
      text: 'text-red-300',
      border: 'border-red-500/30',
      iconBg: 'bg-red-500',
      hoverGlow: 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]',
    },
  };

  const defaultColor = {
    gradient: 'from-grey-500 to-grey-600',
    bg: 'bg-grey-500/20',
    text: 'text-grey-300',
    border: 'border-grey-500/30',
    iconBg: 'bg-grey-500',
    hoverGlow: 'group-hover:shadow-[0_0_30px_rgba(107,114,128,0.3)]',
  };

  return metricMap[metricType.toLowerCase()] || defaultColor;
};


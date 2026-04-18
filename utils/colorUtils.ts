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


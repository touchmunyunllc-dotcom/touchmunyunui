import React from 'react';
import { getStatusColor } from '@/utils/colorUtils';

interface OrderStatusTrackerProps {
  status: string | number | undefined;
}

const statusSteps = [
  { key: 'Pending', label: 'Order Placed', icon: '📦' },
  { key: 'Paid', label: 'Payment', icon: '💳' },
  { key: 'Packed', label: 'Packed', icon: '📋' },
  { key: 'Processing', label: 'Processing', icon: '⚙️' },
  { key: 'Shipped', label: 'Shipped', icon: '🚚' },
  { key: 'Delivered', label: 'Delivered', icon: '✅' },
];

const statusOrder: Record<string, number> = {
  'Pending': 0,
  'Paid': 1,
  'Packed': 2,
  'Processing': 3,
  'Shipped': 4,
  'Delivered': 5,
  'Cancelled': -1,
};

const getStatusIndex = (status: string | number | undefined): number => {
  if (typeof status === 'number') {
    // Map numeric status to step index
    const statusMap: Record<number, number> = {
      0: 0, // Pending -> Order Placed
      1: 1, // Paid -> Payment
      2: 2, // Packed -> Packed
      3: 3, // Processing -> Processing
      4: 4, // Shipped -> Shipped
      5: 5, // Delivered -> Delivered
      6: -1, // Cancelled
    };
    return statusMap[status] ?? 0;
  }
  
  const statusStr = (status || 'Pending').toString();
  if (statusStr === 'Cancelled') return -1;
  
  const index = statusOrder[statusStr];
  return index !== undefined ? index : 0;
};

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ status }) => {
  const currentStatusIndex = getStatusIndex(status);
  const statusText = typeof status === 'number' 
    ? ['Pending', 'Paid', 'Packed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'][status] || 'Pending'
    : (status || 'Pending');
  
  const isCancelled = statusText === 'Cancelled';
  const maxIndex = statusSteps.length - 1;
  const progressWidth = currentStatusIndex >= 0 
    ? `${(currentStatusIndex / maxIndex) * 100}%` 
    : '0%';

  return (
    <div className="w-full py-6">
      <div className="relative">
        {/* Premium Timeline line with gradient */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-primary/30 rounded-full">
          {!isCancelled && (
            <div
              className="h-1 bg-gradient-to-r from-amber-500 via-blue-500 to-emerald-500 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: progressWidth }}
            />
          )}
        </div>

        {/* Status steps with context colors */}
        <div className="relative flex justify-between">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const isCancelled = statusText === 'Cancelled';
            const statusColors = getStatusColor(step.key);

            return (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                {/* Premium Status circle with context color */}
                <div
                  className={`
                    w-14 h-14 rounded-full flex items-center justify-center
                    text-xl font-semibold transition-all duration-300 backdrop-blur-md
                    ${
                      isCancelled && index > 0
                        ? 'bg-red-500/20 text-red-400 border-2 border-red-500/30'
                        : isCompleted
                        ? `${statusColors.iconBg} text-white shadow-lg scale-110 border-2 ${statusColors.border}`
                        : 'bg-primary/40 backdrop-blur-sm border-2 border-foreground/20 text-foreground/50'
                    }
                    ${isCurrent && !isCancelled ? `ring-4 ring-${statusColors.text.split('-')[1]}-500/30` : ''}
                  `}
                >
                  {step.icon}
                </div>

                {/* Status label with context color */}
                <div className="mt-3 text-center">
                  <p
                    className={`
                      text-sm font-medium transition-colors
                      ${isCompleted && !isCancelled ? statusColors.text : 'text-foreground/50'}
                      ${isCurrent && !isCancelled ? `font-bold ${statusColors.text} text-lg` : ''}
                    `}
                  >
                    {step.label}
                  </p>
                  {isCurrent && !isCancelled && (
                    <p className={`text-xs font-semibold ${statusColors.text} mt-1 animate-pulse`}>Current</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium Cancelled status message */}
      {statusText === 'Cancelled' && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 backdrop-blur-sm border-2 border-red-500/30 rounded-lg shadow-glass">
            <span className="text-red-400 text-lg">❌</span>
            <span className="text-sm font-semibold text-red-400">Order Cancelled</span>
          </div>
        </div>
      )}
    </div>
  );
};


import React from 'react';
import { Order } from '@/services/orderService';
import Image from 'next/image';
import { getStatusColor } from '@/utils/colorUtils';
import { EmptyState } from './EmptyState';

interface OrderListProps {
  orders: (Order | any)[]; // Accept both Order and AdminOrder types
  onOrderClick?: (orderId: string) => void;
  showActions?: boolean;
  onStatusUpdate?: (orderId: string, status: string) => void;
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  onOrderClick,
  showActions = false,
  onStatusUpdate,
}) => {

  if (orders.length === 0) {
    return (
      <EmptyState
        variant="orders"
        title="No orders found"
        description="You don't have any orders yet. Start shopping to see your orders here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const statusColors = getStatusColor(order.status);
        return (
          <div
            key={order.id}
            className="group relative bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-6 hover:shadow-xl transition-all duration-500 cursor-pointer border-2 border-foreground/10 hover:border-opacity-50 transform hover:scale-[1.02] hover:-translate-y-1 overflow-hidden"
            onClick={() => onOrderClick?.(order.id)}
          >
          {/* Premium gradient accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${statusColors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          
          {/* Subtle glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${statusColors.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-button transition-colors">
                  Order #{order.orderCode || order.id.slice(0, 8)}
                </h3>
                <p className="text-sm text-foreground/70 group-hover:text-foreground/90 transition-colors">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                {/* Premium status badge with context color */}
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${statusColors.bg} ${statusColors.text} border-2 ${statusColors.border} backdrop-blur-sm shadow-glass transition-all group-hover:scale-110 group-hover:shadow-lg`}
                >
                  {order.status}
                </span>
                <p className="text-lg font-bold text-button mt-2 group-hover:text-gold-400 transition-colors">
                  ${order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="border-t border-foreground/10 pt-4">
              <div className="space-y-2">
                {order.orderItems?.slice(0, 3).map((item: any, index: number) => (
                  <div key={item.id || index} className="flex items-center gap-3 group/item">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-primary/40 backdrop-blur-sm border border-foreground/20 group-hover/item:border-button/50 transition-all duration-300">
                      {item.product?.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name || item.productName}
                          fill
                          className="object-cover group-hover/item:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-foreground/40">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
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
                      <p className="text-sm font-semibold text-foreground group-hover/item:text-button transition-colors">
                        {item.product?.name || item.productName || 'Product'}
                      </p>
                      <p className="text-xs text-foreground/60">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
                {order.orderItems && order.orderItems.length > 3 && (
                  <p className="text-sm text-foreground/60 font-medium">
                    +{order.orderItems.length - 3} more items
                  </p>
                )}
              </div>
            </div>

            {showActions && onStatusUpdate && (
              <div className="mt-4 flex gap-2">
                <select
                  value={order.status}
                  onChange={(e) => {
                    e.stopPropagation();
                    onStatusUpdate(order.id, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white z-10"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Packed">Packed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </div>
        </div>
        );
      })}
    </div>
  );
};


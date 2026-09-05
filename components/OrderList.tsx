import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Order } from '@/services/orderService';
import { IMAGE_SIZES } from '@/lib/imageSizes';
import { getStatusColor } from '@/utils/colorUtils';
import { EmptyState } from './EmptyState';
import { adminSelectClassName, adminSelectOptionProps, adminGridWrapperClassName, adminGridScrollClassName, adminGridTableClassName, adminGridHeadClassName, adminGridHeadCellCompactClassName, adminGridBodyClassName, adminGridRowClassName, adminGridCellCompactClassName } from '@/lib/adminFormStyles';

interface OrderListProps {
  orders: (Order | any)[];
  onOrderClick?: (orderId: string) => void;
  showActions?: boolean;
  onStatusUpdate?: (orderId: string, status: string) => void;
}

const STATUS_OPTIONS = [
  'Pending',
  'Paid',
  'Packed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

function formatOrderDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getCustomerLabel(order: any) {
  const name = order.userName || order.guestName || 'Guest';
  const email = order.userEmail || order.guestEmail;
  return email ? `${name} · ${email}` : name;
}

function normalizeItem(item: any) {
  const productId = item.productId ?? item.product_id ?? item.product?.id;
  const imageUrl =
    item.imageUrl ??
    item.image_url ??
    item.productImageUrl ??
    item.product?.imageUrl ??
    item.product?.images?.[0];
  const name = item.productName ?? item.product_name ?? item.product?.name ?? 'Product';
  return { productId: productId ? String(productId) : undefined, imageUrl, name };
}

function getItemsSummary(order: any) {
  const items = order.orderItems ?? [];
  if (items.length === 0) return 'No items';
  const count = items.length;
  const preview = items
    .slice(0, 2)
    .map((item: any) => normalizeItem(item).name)
    .join(', ');
  const suffix = count > 2 ? ` +${count - 2} more` : '';
  return `${count} item${count === 1 ? '' : 's'} · ${preview}${suffix}`;
}

function stopRowClick(e: React.MouseEvent) {
  e.stopPropagation();
}

function ItemThumbnails({ items, max = 4 }: { items: any[]; max?: number }) {
  const preview = items.slice(0, max);

  return (
    <div className="flex items-center gap-1.5 shrink-0" onClick={stopRowClick}>
      {preview.map((raw, index) => {
        const item = normalizeItem(raw);
        const thumb = (
          <div
            className="relative w-8 h-8 rounded-md overflow-hidden bg-primary/40 border border-foreground/20 hover:border-button/60 transition-colors"
            title={item.name}
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes={IMAGE_SIZES.orderThumbSm}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-foreground/30">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        );

        if (item.productId) {
          return (
            <Link
              key={`${item.productId}-${index}`}
              href={`/admin/products/${item.productId}/edit`}
              title={`Edit ${item.name}`}
              className="shrink-0"
            >
              {thumb}
            </Link>
          );
        }

        return (
          <div key={`item-${index}`} className="shrink-0">
            {thumb}
          </div>
        );
      })}
      {items.length > max && (
        <span className="text-[10px] text-foreground/50 font-medium whitespace-nowrap">
          +{items.length - max}
        </span>
      )}
    </div>
  );
}

function ItemsCell({ order }: { order: any }) {
  const items = order.orderItems ?? [];
  if (items.length === 0) {
    return <span className="text-foreground/50">No items</span>;
  }

  return (
    <div className="flex items-center gap-2 min-w-0">
      <ItemThumbnails items={items} />
      <span className="truncate text-foreground/70 text-xs" title={getItemsSummary(order)}>
        {getItemsSummary(order)}
      </span>
    </div>
  );
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
        description="No orders match the current filters. Try adjusting status or date range."
      />
    );
  }

  return (
    <div className={adminGridWrapperClassName}>
      <div className={`hidden md:block ${adminGridScrollClassName}`}>
        <table className={adminGridTableClassName}>
          <thead className={adminGridHeadClassName}>
            <tr>
              <th className={adminGridHeadCellCompactClassName}>Order</th>
              <th className={adminGridHeadCellCompactClassName}>Customer</th>
              <th className={adminGridHeadCellCompactClassName}>Placed</th>
              <th className={`${adminGridHeadCellCompactClassName} min-w-[220px]`}>Items</th>
              <th className={`${adminGridHeadCellCompactClassName} text-right`}>Total</th>
              <th className={adminGridHeadCellCompactClassName}>Status</th>
              {showActions && onStatusUpdate && (
                <th className={`${adminGridHeadCellCompactClassName} w-36`}>Update</th>
              )}
            </tr>
          </thead>
          <tbody className={adminGridBodyClassName}>
            {orders.map((order) => {
              const statusColors = getStatusColor(order.status);
              return (
                <tr
                  key={order.id}
                  className={`${adminGridRowClassName} cursor-pointer`}
                  onClick={() => onOrderClick?.(order.id)}
                >
                  <td className={`${adminGridCellCompactClassName} whitespace-nowrap font-semibold`}>
                    #{order.orderCode || order.id.slice(0, 8)}
                  </td>
                  <td className={`${adminGridCellCompactClassName} max-w-[200px] truncate text-foreground/80`} title={getCustomerLabel(order)}>
                    {getCustomerLabel(order)}
                  </td>
                  <td className={`${adminGridCellCompactClassName} whitespace-nowrap text-foreground/70 text-xs`}>
                    {formatOrderDate(order.createdAt)}
                  </td>
                  <td className={`${adminGridCellCompactClassName} max-w-[320px]`}>
                    <ItemsCell order={order} />
                  </td>
                  <td className={`${adminGridCellCompactClassName} whitespace-nowrap text-right font-semibold text-button tabular-nums`}>
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className={`${adminGridCellCompactClassName} whitespace-nowrap`}>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors.bg} ${statusColors.text} border ${statusColors.border}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  {showActions && onStatusUpdate && (
                    <td className={adminGridCellCompactClassName} onClick={stopRowClick}>
                      <select
                        value={order.status}
                        onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                        className={`${adminSelectClassName} !w-full !py-1.5 !text-xs`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status} {...adminSelectOptionProps}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-gray-800 bg-gray-900">
        {orders.map((order) => {
          const statusColors = getStatusColor(order.status);
          return (
            <div
              key={order.id}
              className="px-4 py-3 hover:bg-gray-800 cursor-pointer transition-colors"
              onClick={() => onOrderClick?.(order.id)}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    #{order.orderCode || order.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-foreground/60 truncate">{getCustomerLabel(order)}</p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors.bg} ${statusColors.text} border ${statusColors.border}`}
                  >
                    {order.status}
                  </span>
                  <p className="text-sm font-semibold text-button mt-1 tabular-nums">${order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
              <div className="mb-1">
                <ItemsCell order={order} />
              </div>
              <p className="text-[11px] text-foreground/50">{formatOrderDate(order.createdAt)}</p>
              {showActions && onStatusUpdate && (
                <div className="mt-2" onClick={stopRowClick}>
                  <select
                    value={order.status}
                    onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                    className={`${adminSelectClassName} !w-full !py-1.5 !text-xs`}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status} {...adminSelectOptionProps}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

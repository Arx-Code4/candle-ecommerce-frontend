import { Link } from 'react-router-dom';
import type { OrderSummary } from '@/types';
import { orderDetailPath } from '@/constants';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderCardProps {
  order: OrderSummary;
}

export default function OrderCard({ order }: OrderCardProps) {
  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link
      to={orderDetailPath(order.id)}
      aria-label={`View order details, total ETB ${order.totalAmount}`}
      className="flex items-center justify-between rounded-xl border border-border bg-card p-4 text-card-foreground hover:bg-muted/50 transition-colors"
    >
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{date}</span>
        <span className="text-sm">
          {order.itemCount} item{order.itemCount === 1 ? '' : 's'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <OrderStatusBadge status={order.status} />
        <span className="font-semibold">
          <span className="text-muted-foreground mr-1">ETB</span>
          {order.totalAmount}
        </span>
      </div>
    </Link>
  );
}

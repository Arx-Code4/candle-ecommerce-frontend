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
      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-[16px] border border-[#E3D5C8]/40 bg-[#FCF8F3] p-6 shadow-[0_4px_15px_rgba(58,36,24,0.02)] hover:shadow-[0_8px_25px_rgba(58,36,24,0.05)] hover:-translate-y-px transition-all"
    >
      <div className="flex flex-col gap-1.5 mb-4 sm:mb-0">
        <span className="font-heading text-lg text-[var(--lumiere-ink)]">{date}</span>
        <span className="text-[13px] text-[#756D65]">
          {order.itemCount} item{order.itemCount === 1 ? '' : 's'}
        </span>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
        <OrderStatusBadge status={order.status} />
        <span className="font-bold text-[16px] text-[var(--lumiere-ink)]">
          <span className="text-[12px] text-[#756D65] mr-1.5 font-semibold">ETB</span>
          {order.totalAmount}
        </span>
      </div>
    </Link>
  );
}

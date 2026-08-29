import { useParams, Link } from 'react-router-dom';
import { useOrder } from '@/hooks/useOrder';
import OrderStatusBadge from '@/components/common/OrderStatusBadge';
import { ROUTES } from '@/constants';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isPending, isError } = useOrder(id as string);

  if (isPending) {
    return (
      <div
        data-testid="order-detail-loading"
        className="mx-auto max-w-[800px] px-6 md:px-12 lg:px-16 pt-[140px] pb-24 text-center text-[#756D65] flex flex-col items-center gap-4"
      >
        <div className="h-6 w-32 animate-pulse rounded-md bg-[#E3D5C8]/30 mb-8" />
        <div className="h-[400px] w-full animate-pulse rounded-[16px] bg-[#E3D5C8]/20" />
      </div>
    );
  }

  // Deliberately generic: the backend's getOrderByIdForUser throws the
  // same 404 whether the order doesn't exist OR belongs to someone else
  // (eco-5c's single-404 contract) — so this branch never tries to
  // distinguish the two causes either.
  if (isError || !order) {
    return (
      <div className="mx-auto max-w-[800px] px-6 md:px-12 lg:px-16 pt-[140px] pb-24 text-center">
        <p className="text-[13px] text-[#756D65] mb-4">Order not found.</p>
        <Link
          to={ROUTES.ORDERS}
          className="inline-flex h-[42px] items-center justify-center rounded-full bg-[#944A27] px-6 text-[11px] font-semibold text-white hover:brightness-110 transition-all shadow-sm"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-[800px] px-6 md:px-12 lg:px-16 pt-[140px] pb-24">
      <Link
        to={ROUTES.ORDERS}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#756D65] hover:text-[var(--lumiere-copper)] transition-colors mb-8 uppercase tracking-wider"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Orders
      </Link>

      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-[32px] text-[var(--lumiere-ink)] leading-tight mb-2">
            Order Details
          </h1>
          <p className="text-[13px] text-[#756D65]">
            Reference: <span className="font-mono">{order.id.split('-')[0]}</span>
          </p>
        </div>
        <div className="flex-shrink-0">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="mb-10 rounded-[16px] border border-[#E3D5C8]/40 bg-[#FCF8F3] p-6 shadow-[0_4px_15px_rgba(58,36,24,0.02)] text-[13px] text-[var(--lumiere-ink)] flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <h2 className="text-[11px] font-semibold text-[#756D65] uppercase tracking-wider mb-2">
            Date Placed
          </h2>
          <p className="font-medium">{date}</p>
        </div>
        <div className="flex-1">
          <h2 className="text-[11px] font-semibold text-[#756D65] uppercase tracking-wider mb-2">
            Shipping Information
          </h2>
          <p className="font-medium mb-0.5">{order.shippingName}</p>
          <p className="text-[#756D65] mb-0.5">{order.shippingPhone}</p>
          <p className="text-[#756D65]">{order.shippingAddress}</p>
        </div>
      </div>

      <div className="rounded-[16px] border border-[#E3D5C8]/40 overflow-hidden">
        <table className="w-full text-[13px]">
          <thead className="bg-[#FCF8F3] border-b border-[#E3D5C8]/40">
            <tr className="text-left text-[#756D65]">
              <th className="py-4 px-6 font-medium">Item</th>
              <th className="py-4 px-6 text-right font-medium">Qty</th>
              <th className="py-4 px-6 text-right font-medium">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3D5C8]/40">
            {order.items.map((item, i) => (
              <tr key={i} className="text-[var(--lumiere-ink)]">
                <td className="py-4 px-6">
                  <div className="font-medium mb-0.5">{item.productNameSnapshot}</div>
                  <div className="text-[11px] text-[#756D65]">
                    {item.scentSnapshot} • {item.sizeSnapshot}
                  </div>
                </td>
                <td className="py-4 px-6 text-right align-top pt-5">{item.quantity}</td>
                <td className="py-4 px-6 text-right align-top pt-5">
                  <span className="text-[11px] text-[#756D65] mr-1.5 font-semibold">ETB</span>
                  {item.unitPriceSnapshot}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-[#E3D5C8]/60 bg-[#FCF8F3] px-6 py-5">
          <span className="font-medium text-[var(--lumiere-ink)] text-[14px]">Total</span>
          <span className="font-bold text-[16px] text-[var(--lumiere-ink)]">
            <span className="text-[12px] text-[#756D65] mr-1.5 font-semibold">ETB</span>
            {order.totalAmount}
          </span>
        </div>
      </div>
    </div>
  );
}

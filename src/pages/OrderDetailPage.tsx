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
        className="mx-auto max-w-2xl p-6 text-center text-muted-foreground"
      >
        Loading order…
      </div>
    );
  }

  // Deliberately generic: the backend's getOrderByIdForUser throws the
  // same 404 whether the order doesn't exist OR belongs to someone else
  // (eco-5c's single-404 contract) — so this branch never tries to
  // distinguish the two causes either.
  if (isError || !order) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <p className="text-sm text-muted-foreground">Order not found.</p>
        <Link to={ROUTES.ORDERS} className="mt-2 inline-block text-sm underline text-primary">
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
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl text-foreground">Order Details</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mb-6 rounded-xl border border-border bg-card p-4 text-sm text-card-foreground">
        <p className="mb-1 text-muted-foreground">Placed on {date}</p>
        <p className="font-medium">{order.shippingName}</p>
        <p>{order.shippingPhone}</p>
        <p>{order.shippingAddress}</p>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 font-medium">Item</th>
            <th className="py-2 font-medium">Scent / Size</th>
            <th className="py-2 text-right font-medium">Qty</th>
            <th className="py-2 text-right font-medium">Price</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td className="py-2">{item.productNameSnapshot}</td>
              <td className="py-2 text-muted-foreground">
                {item.scentSnapshot} / {item.sizeSnapshot}
              </td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">
                <span className="text-muted-foreground mr-1">ETB</span>
                {item.unitPriceSnapshot}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="font-medium">Total</span>
        <span className="font-semibold">
          <span className="text-muted-foreground mr-1">ETB</span>
          {order.totalAmount}
        </span>
      </div>
    </div>
  );
}

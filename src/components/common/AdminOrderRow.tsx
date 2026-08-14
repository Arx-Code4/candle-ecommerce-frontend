import OrderStatusBadge from '@/components/common/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { useUpdateAdminOrderStatus } from '@/hooks/useUpdateAdminOrderStatus';
import type { AdminOrderSummary } from '@/types';

interface AdminOrderRowProps {
  order: AdminOrderSummary;
}

export default function AdminOrderRow({ order }: AdminOrderRowProps) {
  const { mutate, isPending } = useUpdateAdminOrderStatus();
  const itemCount = order.itemCount ?? order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <article className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{order.customerName}</p>
        <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {itemCount} {itemCount === 1 ? 'item' : 'items'} · {order.totalAmount}
        </p>
        <div className="mt-2">
          <OrderStatusBadge status={order.status} />
          <span className="sr-only">{order.status}</span>
        </div>
      </div>

      {order.status === 'PROCESSING' && (
        <Button
          type="button"
          disabled={isPending}
          aria-label={`Mark ${order.id} as shipped`}
          onClick={() => mutate({ id: order.id, status: 'SHIPPED' })}
        >
          {isPending ? 'Updating…' : 'Mark as Shipped'}
        </Button>
      )}
    </article>
  );
}

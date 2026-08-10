import { useOrders } from '@/hooks/useOrders';
import OrderCard from '@/components/common/OrderCard';
import EmptyState from '@/components/common/EmptyState';
import { ROUTES } from '@/constants';

export default function OrderHistoryPage() {
  const { data, isLoading, isError } = useOrders();

  if (isLoading) {
    return (
      <div
        data-testid="order-history-skeleton"
        className="mx-auto max-w-2xl p-6 flex flex-col gap-3"
      >
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-destructive">Failed to load your orders. Please try again.</p>
      </div>
    );
  }

  const orders = data?.items ?? [];

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <EmptyState
          message="You haven't placed any orders yet."
          ctaLabel="Browse catalog"
          ctaHref={ROUTES.CATALOG}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6 flex flex-col gap-3">
      <h1 className="mb-2 font-heading text-2xl text-foreground">Order History</h1>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

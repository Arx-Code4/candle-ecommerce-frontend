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
        className="mx-auto max-w-[1000px] px-6 md:px-12 lg:px-16 pt-[140px] pb-24 flex flex-col gap-4"
      >
        <div className="h-8 w-48 mb-8 animate-pulse rounded-md bg-[#E3D5C8]/30" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[104px] animate-pulse rounded-[16px] bg-[#E3D5C8]/20" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-[1000px] px-6 md:px-12 lg:px-16 pt-[140px] pb-24 text-center">
        <p className="text-[13px] font-medium text-red-600">
          Failed to load your orders. Please try again.
        </p>
      </div>
    );
  }

  const orders = data?.items ?? [];

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-[1000px] px-6 md:px-12 lg:px-16 pt-[140px] pb-24">
        <EmptyState
          message="You haven't placed any orders yet."
          ctaLabel="Browse Catalog"
          ctaHref={ROUTES.CATALOG}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] px-6 md:px-12 lg:px-16 pt-[140px] pb-24 flex flex-col">
      <div className="mb-10 text-center md:text-left">
        <h1 className="font-heading text-[32px] md:text-[40px] text-[var(--lumiere-ink)] leading-tight mb-2">
          Order History
        </h1>
        <p className="text-[13px] text-[#756D65]">Track and manage your past purchases.</p>
      </div>

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}

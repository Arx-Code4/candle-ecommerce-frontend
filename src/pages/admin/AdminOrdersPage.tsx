import { useState } from 'react';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import AdminOrderRow from '@/components/common/AdminOrderRow';
import EmptyState from '@/components/common/EmptyState';
import { Label } from '@/components/ui/label';
import type { OrderStatus } from '@/types';

export default function AdminOrdersPage() {
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const { data, isLoading, isError } = useAdminOrders(status ? { status } : {});

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading orders…</p>;
  }

  if (isError) {
    return <p className="text-sm text-destructive">Failed to load orders.</p>;
  }

  const orders = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-heading text-2xl text-foreground">Orders</h2>
        <div className="space-y-1">
          <Label htmlFor="order-status-filter">Filter by status</Label>
          <select
            id="order-status-filter"
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus | '')}
          >
            <option value="">All</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState message="No orders yet." />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <AdminOrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

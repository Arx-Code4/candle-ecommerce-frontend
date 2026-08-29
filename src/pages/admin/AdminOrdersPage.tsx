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
    <div className="max-w-5xl space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-[32px] md:text-[40px] text-[var(--lumiere-ink)] leading-tight">
            Orders
          </h1>
          <p className="text-[14px] text-[#756D65]">View and fulfill customer purchases.</p>
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          <Label
            htmlFor="order-status-filter"
            className="text-[11px] font-semibold text-[#756D65] uppercase tracking-wider"
          >
            Filter Status
          </Label>
          <select
            id="order-status-filter"
            className="h-10 rounded-[10px] border border-[#E3D5C8] bg-white px-4 text-[13px] font-medium text-[var(--lumiere-ink)] focus:outline-none focus:border-[#944A27] focus:ring-1 focus:ring-[#944A27] transition-all shadow-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus | '')}
          >
            <option value="">All Orders</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
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

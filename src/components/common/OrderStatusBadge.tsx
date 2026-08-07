// src/components/common/OrderStatusBadge.tsx

interface OrderStatusBadgeProps {
  status: string;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <span data-status={status}>{status}</span>;
}

interface OrderStatusBadgeProps {
  status: string;
}

const STATUS_LABELS: Record<string, string> = {
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
};

const STATUS_STYLES: Record<string, string> = {
  PROCESSING: 'bg-warning text-warning-foreground',
  SHIPPED: 'bg-success text-success-foreground',
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const label = STATUS_LABELS[status] ?? status;
  const style = STATUS_STYLES[status] ?? 'bg-muted text-muted-foreground';

  return (
    <span
      data-status={status}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}

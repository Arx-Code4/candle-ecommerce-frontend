interface OrderStatusBadgeProps {
  status: string;
}

const STATUS_LABELS: Record<string, string> = {
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
};

const STATUS_STYLES: Record<string, string> = {
  PROCESSING: 'bg-[#FDF6E3] text-[#944A27] border-[#944A27]/20',
  SHIPPED: 'bg-[#ECF5EC] text-[#2A5E2A] border-[#2A5E2A]/20',
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const label = STATUS_LABELS[status] ?? status;
  const style = STATUS_STYLES[status] ?? 'bg-[#F2EBE5] text-[#756D65] border-[#E3D5C8]';

  return (
    <span
      data-status={status}
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold border uppercase tracking-wider ${style}`}
    >
      {label}
    </span>
  );
}

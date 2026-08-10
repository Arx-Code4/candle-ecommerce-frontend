import type { FC } from 'react';

interface StockBadgeProps {
  stock: number;
}

const StockBadge: FC<StockBadgeProps> = ({ stock }) => {
  let label: string;
  let style: string;

  if (stock > 0) {
    label = 'In Stock';
    style = 'bg-success text-success-foreground';
  } else if (stock === 0) {
    label = 'Out of Stock';
    style = 'bg-muted text-muted-foreground';
  } else {
    // Negative stock — confirmChapaPayment (checkout.service.ts) deliberately
    // allows stock to go negative rather than blocking an already-paid order.
    // This is the visible signal that an admin needs to look at, distinct
    // from the routine "sold out" state.
    label = 'Oversold';
    style = 'bg-destructive text-destructive-foreground';
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
};

export default StockBadge;

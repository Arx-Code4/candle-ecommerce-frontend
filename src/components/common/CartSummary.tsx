import type { FC } from 'react';
import { Button } from '@/components/ui/button';

interface CartSummaryProps {
  total: string;
  itemCount: number;
  readOnly?: boolean;
  onCheckout?: () => void;
}

const CartSummary: FC<CartSummaryProps> = ({ total, itemCount, readOnly = false, onCheckout }) => {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-card-foreground">
      <h2 className="text-sm font-medium text-muted-foreground mb-3">Order Summary</h2>

      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-muted-foreground">Items</span>
        <span>{itemCount}</span>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3 mt-1">
        <span className="font-medium">Subtotal</span>
        <span className="font-semibold">
          <span className="text-muted-foreground mr-1">ETB</span>
          {total}
        </span>
      </div>

      {!readOnly && (
        <Button className="w-full mt-4" disabled={itemCount === 0} onClick={onCheckout}>
          Proceed to Checkout
        </Button>
      )}
    </div>
  );
};

export default CartSummary;

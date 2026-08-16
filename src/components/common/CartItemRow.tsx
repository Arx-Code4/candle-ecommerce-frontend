import { useEffect, useState, type FC } from 'react';
import type { CartItem, CartMutationResult } from '@/types';
import { useUpdateCartItem } from '@/hooks/useUpdateCartItem';
import { useRemoveCartItem } from '@/hooks/useRemoveCartItem';

interface CartItemRowProps {
  item: CartItem;
}

const CartItemRow: FC<CartItemRowProps> = ({ item }) => {
  const [prevItemQuantity, setPrevItemQuantity] = useState(item.quantity);

  const [pendingQuantity, setPendingQuantity] = useState(item.quantity);
  const [toast, setToast] = useState<string | null>(null);

  const { mutate: updateMutate, isPending: isUpdating } = useUpdateCartItem();
  const { mutate: removeMutate, isPending: isRemoving } = useRemoveCartItem();

  if (item.quantity !== prevItemQuantity) {
    setPrevItemQuantity(item.quantity);
    setPendingQuantity(item.quantity);
  }
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const changeQuantity = (nextQuantity: number) => {
    // Local echo updates immediately, independent of whether/when the
    // mutation resolves — this is what makes the stepper feel responsive
    // rather than waiting on a round trip for every click.
    setPendingQuantity(nextQuantity);
    updateMutate(
      { itemId: item.id, quantity: nextQuantity },
      {
        onSuccess: (data: CartMutationResult) => {
          if (data.wasCapped) {
            setToast(`Quantity adjusted to available stock (${data.cappedTo} available)`);
          }
        },
      }
    );
  };

  const handleRemove = () => removeMutate({ itemId: item.id });

  if (!item.available) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 opacity-50">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">{item.name}</span>
          <span className="text-xs text-muted-foreground">No longer available</span>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          disabled={isRemoving}
          className="text-sm text-destructive underline disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-foreground">{item.name}</span>
        <span className="text-xs text-muted-foreground">
          {item.scent} / {item.size}
        </span>
        <span className="text-sm">
          <span className="text-muted-foreground mr-1">ETB</span>
          {item.unitPrice}
        </span>
        <span className="text-sm font-medium">
          <span className="text-muted-foreground mr-1">Subtotal:</span>
          ETB {item.subtotal}
        </span>
        {toast && <span className="text-xs text-warning-foreground">{toast}</span>}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={isUpdating || pendingQuantity <= 1}
          onClick={() => changeQuantity(Math.max(1, pendingQuantity - 1))}
          className="h-8 w-8 rounded-full border border-input text-sm disabled:opacity-50"
        >
          −
        </button>
        <input
          type="text"
          readOnly
          value={pendingQuantity}
          aria-label="Quantity"
          className="w-10 text-center text-sm"
        />
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={isUpdating}
          onClick={() => changeQuantity(pendingQuantity + 1)}
          className="h-8 w-8 rounded-full border border-input text-sm disabled:opacity-50"
        >
          +
        </button>

        <button
          type="button"
          onClick={handleRemove}
          disabled={isRemoving}
          className="ml-2 text-sm text-destructive underline disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItemRow;

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
    setPendingQuantity(nextQuantity);
    updateMutate(
      { itemId: item.id, quantity: nextQuantity },
      {
        onSuccess: (data: CartMutationResult) => {
          if (data.wasCapped) {
            setToast(`Max ${data.cappedTo} available`);
          }
        },
      }
    );
  };

  const handleRemove = () => removeMutate({ itemId: item.id });

  if (!item.available) {
    return (
      <div className="flex items-center justify-between p-6 bg-white opacity-50">
        <div className="flex items-center gap-4">
          <div className="size-20 rounded-[12px] bg-[#F3E9DE] flex shrink-0"></div>
          <div className="flex flex-col">
            <span className="font-heading text-[18px] text-[var(--lumiere-ink)]">{item.name}</span>
            <span className="text-[11px] text-[#756D65]">No longer available</span>
          </div>
        </div>
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="text-[12px] text-destructive underline disabled:opacity-50 font-medium"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white hover:bg-[#FCF8F3]/50 transition-colors">
      {/* Left: Image & Info */}
      <div className="flex items-center gap-6 flex-1 w-full">
        <img
          src={
            item.photoUrl ||
            (item as CartItem & { primaryPhotoUrl?: string }).primaryPhotoUrl ||
            '/images/discovery-candle.webp'
          }
          src={
            item.photoUrl ||
            (item as CartItem & { primaryPhotoUrl?: string }).primaryPhotoUrl ||
            '/images/discovery-candle.webp'
          }
          alt={item.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/discovery-candle.webp';
          }}
          className="size-24 p-1 rounded-[12px] object-contain bg-[#F3E9DE] shrink-0 shadow-sm"
        />
        <div className="flex flex-col min-w-[120px]">
          <h3 className="font-heading text-[20px] text-[var(--lumiere-ink)] mb-1 leading-tight">
            {item.name}
          </h3>
          <span className="text-[11px] font-semibold text-[#944A27] mb-1">{item.scent}</span>
          <span className="text-[11px] text-[#756D65]">{item.size} • Glass Jar</span>
          {toast && <span className="text-[10px] text-destructive mt-1 font-medium">{toast}</span>}
        </div>
      </div>

      {/* Right: Controls & Price */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-8">
        {/* Unit Price (Hidden on mobile for space, visible on sm+) */}
        <span className="hidden sm:block text-[13px] font-bold text-[var(--lumiere-ink)] min-w-[80px]">
          ETB {item.unitPrice}
        </span>

        {/* Quantity Stepper */}
        <div className="flex items-center h-[36px] rounded-full border border-[#E3D5C8] bg-[#FCF8F3] px-1 shrink-0">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={isUpdating || pendingQuantity <= 1}
            onClick={() => changeQuantity(Math.max(1, pendingQuantity - 1))}
            className="w-8 h-full flex items-center justify-center text-[#756D65] hover:text-[var(--lumiere-ink)] disabled:opacity-30 transition-colors"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <span
            data-testid="item-quantity"
            className="w-8 text-center text-[13px] font-semibold text-[var(--lumiere-ink)]"
          >
            {pendingQuantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={isUpdating}
            onClick={() => changeQuantity(pendingQuantity + 1)}
            className="w-8 h-full flex items-center justify-center text-[#756D65] hover:text-[var(--lumiere-ink)] disabled:opacity-30 transition-colors"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Subtotal Price */}
        <span className="text-[13px] font-bold text-[var(--lumiere-ink)] min-w-[80px] text-right">
          ETB {item.subtotal}
        </span>

        {/* Remove Button */}
        <button
          type="button"
          aria-label="Remove item"
          onClick={handleRemove}
          disabled={isRemoving}
          className="size-[36px] rounded-[10px] border border-[#E3D5C8] bg-[#FCF8F3] flex items-center justify-center text-[#944A27] hover:bg-[#F3E9DE] disabled:opacity-50 transition-colors shrink-0"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CartItemRow;

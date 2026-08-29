import type { FC } from 'react';

interface CartSummaryProps {
  total: string;
  itemCount: number;
  readOnly?: boolean;
  onCheckout?: () => void;
}

const CartSummary: FC<CartSummaryProps> = ({ total, itemCount, readOnly = false, onCheckout }) => {
  const numericTotal = parseFloat(total.replace(/,/g, ''));
  const FREE_SHIPPING_THRESHOLD = 2000;
  const awayFromFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - numericTotal);
  const progressPercent = Math.min(100, (numericTotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Card */}
      <div className="bg-[#FCF8F3] rounded-[16px] p-6 md:p-8 border border-[#E3D5C8]/40 shadow-[0_4px_15px_rgba(58,36,24,0.02)]">
        <h2 className="font-heading text-[24px] text-[var(--lumiere-ink)] mb-8">Order Summary</h2>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-semibold text-[var(--lumiere-ink)]">Subtotal</span>
            <span className="font-bold text-[var(--lumiere-ink)]">ETB {total}</span>
          </div>

          <div className="flex items-center justify-between text-[13px]">
            <span className="font-semibold text-[var(--lumiere-ink)] flex items-center gap-1.5">
              Shipping
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#756D65]"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </span>
            <span className="text-[#756D65]">Calculated at checkout</span>
          </div>
        </div>

        <div className="h-[1px] w-full bg-[#E3D5C8]/60 my-6"></div>

        <div className="flex items-center justify-between mb-8">
          <span className="font-semibold text-[var(--lumiere-ink)] text-[14px]">Total</span>
          <span className="font-bold text-[var(--lumiere-ink)] text-[16px]">ETB {total}</span>
        </div>

        {!readOnly && (
          <button
            disabled={itemCount === 0}
            onClick={onCheckout}
            className="w-full h-[52px] rounded-[10px] bg-[#944A27] text-white text-[13px] font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-sm disabled:opacity-50 disabled:hover:brightness-100"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Proceed to Checkout
          </button>
        )}

        <div className="flex items-center justify-center gap-2 mt-4 text-[#756D65]">
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
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span className="text-[10px] font-medium">
            Secure checkout. Your information is safe with us.
          </span>
        </div>
      </div>

      {/* Free Shipping Widget */}
      <div className="bg-[#FCF8F3] rounded-[16px] p-6 border border-[#E3D5C8]/40 shadow-[0_4px_15px_rgba(58,36,24,0.02)] flex flex-col">
        <div className="flex gap-4 mb-4">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            className="text-[#944A27] shrink-0"
          >
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-[var(--lumiere-ink)] leading-tight mb-1">
              Free shipping on orders over ETB 2,000
            </span>
            {awayFromFreeShipping > 0 ? (
              <span className="text-[11px] text-[#756D65] leading-tight">
                Add{' '}
                <span className="font-semibold text-[#944A27]">
                  ETB {awayFromFreeShipping.toFixed(2)}
                </span>{' '}
                more to unlock free shipping.
              </span>
            ) : (
              <span className="text-[11px] text-[#944A27] font-semibold leading-tight">
                You've unlocked free shipping!
              </span>
            )}
          </div>
        </div>
        <div className="w-full h-[6px] bg-[#E3D5C8]/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#944A27] transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default CartSummary;

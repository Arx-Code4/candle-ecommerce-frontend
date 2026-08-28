import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import CartItemRow from '@/components/common/CartItemRow';
import CartSummary from '@/components/common/CartSummary';
import { ROUTES } from '@/constants';

const ValueStrip = () => (
  <div className="w-full bg-[#FCF8F3] rounded-[16px] px-8 py-6 flex flex-wrap items-center justify-between gap-6 border border-[#E3D5C8]/40 mb-12">
    <div className="flex items-center gap-3">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="text-[#944A27]"
      >
        <path d="M12 2C12 2 8 6.5 8 11C8 13.5 10 16 12 16C14 16 16 13.5 16 11C16 6.5 12 2 12 2Z" />
        <path d="M6 14v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" />
      </svg>
      <div className="flex flex-col">
        <span className="text-[12px] font-semibold text-[var(--lumiere-ink)] leading-tight">
          Hand-poured
        </span>
        <span className="text-[11px] text-[#756D65] leading-tight">with love</span>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="text-[#944A27]"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
      <div className="flex flex-col">
        <span className="text-[12px] font-semibold text-[var(--lumiere-ink)] leading-tight">
          Small-batch
        </span>
        <span className="text-[11px] text-[#756D65] leading-tight">made</span>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="text-[#944A27]"
      >
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 1 8.3C19.2 15.66 15.14 20 11 20z" />
        <path d="M11 20c2-5 3.5-7.5 8-10" />
      </svg>
      <div className="flex flex-col">
        <span className="text-[12px] font-semibold text-[var(--lumiere-ink)] leading-tight">
          Natural soy wax
        </span>
        <span className="text-[11px] text-[#756D65] leading-tight">& clean ingredients</span>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="text-[#944A27]"
      >
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <path d="M12 8v13" />
        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
        <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
      </svg>
      <div className="flex flex-col">
        <span className="text-[12px] font-semibold text-[var(--lumiere-ink)] leading-tight">
          Beautifully packaged
        </span>
        <span className="text-[11px] text-[#756D65] leading-tight">Perfect for gifting</span>
      </div>
    </div>
  </div>
);

export default function CartPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCart();

  const items = cart?.items ?? [];
  const isCheckoutDisabled = items.every((item) => !item.available);

  return (
    <div className="w-full min-h-[calc(100vh-90px)] bg-[var(--lumiere-ivory)] overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative w-full pt-4 pb-12 md:pt-8 md:pb-16 px-6 md:px-12 lg:px-16 flex items-center min-h-[380px]">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="w-full md:w-[45%] flex flex-col">
            <span className="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#944A27] mb-4">
              YOUR CART
            </span>
            <h1 className="font-heading text-[44px] md:text-[56px] leading-[1.1] text-[var(--lumiere-ink)] mb-4">
              Thoughtfully chosen.
              <br />
              Beautifully <span className="text-[#944A27]">yours.</span>
            </h1>
            <p className="text-[13px] leading-[1.6] text-[#756D65] font-medium">
              You're just a step away from bringing warmth home.
            </p>
          </div>
          <div className="w-full md:w-[55%] flex justify-end">
            <img
              src="/images/contact-hero.webp"
              alt="Lumiere Candle"
              className="w-full max-w-[500px] h-[240px] md:h-[280px] rounded-[16px] object-cover shadow-[0_10px_35px_rgba(58,36,24,0.06)]"
            />
          </div>
        </div>
      </section>

      {/* 2. Main Layout (Cart Items + Summary) */}
      <section className="w-full pb-16 px-6 md:px-12 lg:px-16">
        <div className="container mx-auto flex flex-col lg:flex-row gap-10">
          {/* Left Area (Items & Value Strip) */}
          <div className="flex-1 flex flex-col">
            {isLoading ? (
              <div className="p-8 text-center text-[13px] text-[#756D65]">Loading your cart…</div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-[16px] border border-[#E3D5C8]/40 p-12 text-center shadow-[0_4px_15px_rgba(58,36,24,0.02)] mb-8 flex flex-col items-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-[#D9D1C7] mb-4"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <h3 className="font-heading text-[24px] text-[var(--lumiere-ink)] mb-2">
                  Your cart is empty.
                </h3>
                <p className="text-[13px] text-[#756D65] mb-6">
                  Explore our signature scents to find your perfect match.
                </p>
                <Link
                  to={ROUTES.CATALOG}
                  className="bg-[#944A27] text-white px-6 py-2.5 rounded-[8px] text-[12px] font-semibold hover:brightness-110 transition-all shadow-sm"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="bg-[#FCF8F3] rounded-[16px] border border-[#E3D5C8]/40 shadow-[0_4px_15px_rgba(58,36,24,0.02)] mb-8 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3D5C8]/40 bg-white/50">
                  <div className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-[#944A27]"
                    >
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    <span className="text-[13px] font-semibold text-[var(--lumiere-ink)]">
                      {items.length} {items.length === 1 ? 'Item' : 'Items'}
                    </span>
                  </div>
                  <Link
                    to={ROUTES.CATALOG}
                    className="text-[12px] font-semibold text-[#944A27] hover:underline flex items-center gap-1"
                  >
                    Continue Shopping{' '}
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
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                <div className="flex flex-col divide-y divide-[#E3D5C8]/40">
                  {items.map((item) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            <ValueStrip />
          </div>

          {/* Right Area (Summary) */}
          <div className="w-full lg:w-[340px] shrink-0">
            <CartSummary
              total={cart?.total ?? '0.00'}
              itemCount={isCheckoutDisabled ? 0 : items.length}
              onCheckout={() => navigate(ROUTES.CHECKOUT)}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

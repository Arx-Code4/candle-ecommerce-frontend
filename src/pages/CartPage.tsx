// src/pages/CartPage.tsx
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import CartItemRow from '@/components/common/CartItemRow';
import CartSummary from '@/components/common/CartSummary';
import EmptyState from '@/components/common/EmptyState';
import { ROUTES } from '@/constants';

export default function CartPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCart();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl p-6 text-center text-muted-foreground">
        Loading your cart…
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <EmptyState
          message="Your cart is empty."
          ctaLabel="Browse products"
          ctaHref={ROUTES.CATALOG}
        />
      </div>
    );
  }

  const isCheckoutDisabled = items.every((item) => !item.available);

  return (
    <div className="mx-auto max-w-3xl p-6 grid gap-6 md:grid-cols-[1fr_280px]">
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </div>

      <CartSummary
        total={cart?.total ?? '0.00'}
        itemCount={isCheckoutDisabled ? 0 : items.length}
        onCheckout={() => navigate(ROUTES.CHECKOUT)}
      />
    </div>
  );
}

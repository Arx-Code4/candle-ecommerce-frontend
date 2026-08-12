import { Outlet, Link } from 'react-router-dom';
import { ShoppingBag, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCart } from '@/hooks/useCart';
import { useLogout } from '@/hooks/useLogout';
import { ShopFooter } from '@/components/common/ShopFooter';
import { ROUTES } from '@/constants';

export default function DashboardLayout() {
  const user = useAuthStore((s) => s.user);
  const { data: cart } = useCart();
  const { mutate: logout, isPending } = useLogout();
  const cartCount = cart?.items.length ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link
          to={ROUTES.HOME}
          aria-label="Home"
          className="font-heading text-xl tracking-widest text-foreground"
        >
          LUMIÈRE
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to={ROUTES.CATALOG}
            aria-label="Catalog"
            className="flex items-center gap-1.5 text-sm text-foreground hover:text-primary"
          >
            <ShoppingBag className="size-4" />
            Products
          </Link>

          <Link
            to={ROUTES.CART}
            className="flex items-center gap-1.5 text-sm text-foreground hover:text-primary"
          >
            <ShoppingCart className="size-4" />
            Cart
            {cartCount > 0 && (
              <span
                data-testid="cart-badge"
                className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground"
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Deliberate deviation from the literal mockup screenshot: it
              always shows "Login" even here, but that's a static prototype
              not wired to real auth. This route is only reachable when
              authenticated (ProtectedRoute), so showing "Login" again would
              be functionally wrong, not just cosmetically off. */}
          <button
            type="button"
            onClick={() => logout()}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? 'Logging out…' : (user?.email ?? 'Log out')}
          </button>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <ShopFooter />
    </div>
  );
}

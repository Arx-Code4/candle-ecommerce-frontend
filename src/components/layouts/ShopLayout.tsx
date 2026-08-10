import { Outlet, Link } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, LogIn } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { ShopFooter } from '@/components/common/ShopFooter';
import { ROUTES } from '@/constants';

export default function ShopLayout() {
  // useCart() now handles the anonymous-visitor guard internally —
  // this layout has no auth logic of its own anymore.
  const { data: cart } = useCart();
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

          <Link
            to={ROUTES.LOGIN}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            <LogIn className="size-4" />
            Login
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <ShopFooter />
    </div>
  );
}

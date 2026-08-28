import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, LogIn } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/useLogout';
import { ROUTES } from '@/constants';

export function Header() {
  const { data: cart } = useCart();
  const cartCount = cart?.items.length ?? 0;
  const location = useLocation();
  const isHome = location.pathname === ROUTES.HOME || location.pathname === '/';
  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();

  return (
    <header
      className={`absolute top-0 left-0 right-0 z-50 flex h-[80px] items-center justify-between px-6 md:px-12 lg:px-16 ${isHome ? 'bg-transparent text-[var(--lumiere-ivory)]' : 'bg-[var(--lumiere-ivory)] text-[var(--lumiere-ink)] border-b border-[#E3D5C8]'}`}
    >
      {/* Logo */}
      <Link to={ROUTES.HOME} aria-label="Home" className="flex flex-col items-center">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-1 text-[var(--lumiere-copper)]"
        >
          {/* A simple flame/leaf placeholder icon */}
          <path
            d="M12 2C12 2 7 8 7 13C7 16 9 19 12 19C15 19 17 16 17 13C17 8 12 2 12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="font-heading text-[28px] leading-none tracking-[0.11em]">LUMIÈRE</div>
        <div className="mt-1 text-[7px] font-medium tracking-[0.18em]">SCENTS THAT STAY</div>
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-8 text-[12px] font-medium">
        <Link
          to={ROUTES.HOME}
          className="hover:text-[var(--lumiere-copper-light)] transition-colors"
        >
          Home
        </Link>
        <Link
          to={ROUTES.CATALOG}
          className="hover:text-[var(--lumiere-copper-light)] transition-colors"
        >
          Products
        </Link>
        <Link
          to={ROUTES.ABOUT}
          className="hover:text-[var(--lumiere-copper-light)] transition-colors"
        >
          About Us
        </Link>
        <Link
          to={ROUTES.CONTACT}
          className="hover:text-[var(--lumiere-copper-light)] transition-colors"
        >
          Contact
        </Link>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <Link
          to={ROUTES.CART}
          className="flex items-center gap-2 text-[12px] font-medium hover:text-[var(--lumiere-copper-light)] transition-colors"
        >
          <ShoppingBag className="size-[18px] stroke-[1.5px]" />
          <span>Cart ({cartCount})</span>
        </Link>
        {user ? (
          <div className="flex items-center gap-3 relative group">
            <div className="hidden lg:flex flex-col items-end mr-1">
              <span className="text-[11px] font-semibold leading-tight capitalize">
                {user.email.split('@')[0]}
              </span>
              <span className="text-[9px] opacity-70 leading-tight">{user.email}</span>
            </div>
            <button
              onClick={() => logout()}
              title="Click to logout"
              className={`flex items-center justify-center size-[34px] rounded-full font-heading text-[16px] cursor-pointer transition-all ${isHome ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-primary text-white hover:brightness-110 shadow-sm'}`}
            >
              {user.email.charAt(0).toUpperCase()}
            </button>
          </div>
        ) : (
          <Link
            to={ROUTES.LOGIN}
            className="hidden md:flex items-center gap-1.5 rounded-full bg-primary px-[18px] py-[10px] text-[11px] font-semibold text-white hover:brightness-105 hover:-translate-y-px transition-all shadow-sm"
          >
            <LogIn className="size-3.5" />
            Login
          </Link>
        )}
      </div>
    </header>
  );
}

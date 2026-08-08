import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/useLogout';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';

function adminNavLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'text-sm font-medium transition-colors',
    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
  );
}

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const { mutate: logout, isPending } = useLogout();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <p className="font-semibold text-foreground">Candle Store Admin</p>
          <nav className="flex items-center gap-4">
            <NavLink to={ROUTES.ADMIN_PRODUCTS} className={adminNavLinkClass}>
              Products
            </NavLink>
            <NavLink to={ROUTES.ADMIN_ORDERS} className={adminNavLinkClass}>
              Orders
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user && <p className="text-muted-foreground text-sm">{user.email}</p>}
          <Button variant="outline" onClick={() => logout()} disabled={isPending}>
            {isPending ? 'Logging out…' : 'Log out'}
          </Button>
        </div>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

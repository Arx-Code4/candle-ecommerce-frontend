import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';

function sidebarLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
  );
}

export default function AdminLayout() {
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-60 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="px-5 py-6 border-b border-sidebar-border">
          <p className="font-heading text-lg text-sidebar-foreground">LUMIÈRE</p>
          <p className="text-xs text-muted-foreground mt-1">Admin</p>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          <NavLink to={ROUTES.ADMIN_PRODUCTS} className={sidebarLinkClass}>
            Products
          </NavLink>
          <NavLink to={ROUTES.ADMIN_ORDERS} className={sidebarLinkClass}>
            Orders
          </NavLink>
        </nav>
        <div className="mt-auto p-3 border-t border-sidebar-border">
          {user && <p className="mb-2 truncate px-1 text-xs text-muted-foreground">{user.email}</p>}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => logout()}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out…' : 'Logout'}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-card px-6 py-4">
          <h1 className="font-heading text-xl text-foreground">Candle Store Admin</h1>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

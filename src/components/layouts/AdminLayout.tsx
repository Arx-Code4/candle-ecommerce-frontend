import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';

function sidebarLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'flex items-center gap-3 rounded-lg px-4 py-3 text-[13px] font-semibold uppercase tracking-wider transition-all duration-200',
    isActive
      ? 'bg-[#944A27] text-white shadow-md'
      : 'text-[#756D65] hover:bg-[#E3D5C8]/40 hover:text-[#4B4540]'
  );
}

export default function AdminLayout() {
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <div className="min-h-screen flex bg-[#FDF6E3] font-body selection:bg-[#E3D5C8]/40">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-[#E3D5C8] bg-[#FCF8F3] flex flex-col shadow-[4px_0_24px_rgba(58,36,24,0.02)] z-20">
        <div className="px-8 py-8 border-b border-[#E3D5C8]/60">
          <p className="font-heading text-2xl tracking-[0.1em] text-[var(--lumiere-ink)]">
            LUMIÈRE
          </p>
          <p className="text-[11px] font-semibold text-[#944A27] uppercase tracking-[0.2em] mt-1.5">
            Admin
          </p>
        </div>

        <nav className="flex flex-col gap-2 p-5 flex-1">
          <NavLink to={ROUTES.ADMIN_DASHBOARD} end className={sidebarLinkClass}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
            Dashboard
          </NavLink>
          <NavLink to={ROUTES.ADMIN_PRODUCTS} className={sidebarLinkClass}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
            Products
          </NavLink>
          <NavLink to={ROUTES.ADMIN_ORDERS} className={sidebarLinkClass}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Orders
          </NavLink>
        </nav>

        <div className="p-5 border-t border-[#E3D5C8]/60 bg-[#F3E9DE]/30">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-[#944A27] text-white flex items-center justify-center font-heading text-sm font-bold shadow-sm">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[12px] font-bold text-[var(--lumiere-ink)] truncate">
                Administrator
              </span>
              <span className="text-[10px] text-[#756D65] truncate">{user?.email}</span>
            </div>
          </div>

          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="flex items-center justify-center gap-2 w-full h-10 rounded-lg border border-[#E3D5C8] bg-white text-[12px] font-bold uppercase tracking-wider text-[var(--lumiere-ink)] hover:bg-[#F3E9DE] transition-colors disabled:opacity-50"
          >
            <LogOut size={16} className="text-[#944A27]" />
            {isLoggingOut ? 'Logging out...' : 'Log Out'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col h-screen overflow-y-auto">
        <main className="flex-1 px-8 md:px-12 lg:px-16 py-12 pb-24">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

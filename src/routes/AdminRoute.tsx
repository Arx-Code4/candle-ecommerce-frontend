import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants';

// DEFAULT (decision #4, not yet confirmed): non-admins bounce to HOME.
// No Forbidden page exists yet — swap this redirect target if one gets built.
export default function AdminRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  if (!accessToken) return <Navigate to={ROUTES.LOGIN} replace />;
  if (user?.role !== 'ADMIN') return <Navigate to={ROUTES.HOME} replace />;
  return <Outlet />;
}

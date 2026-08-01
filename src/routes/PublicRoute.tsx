import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants';

export default function PublicRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return accessToken ? <Navigate to={ROUTES.HOME} replace /> : <Outlet />;
}

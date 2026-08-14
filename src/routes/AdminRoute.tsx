import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';

export default function AdminRoute() {
  const { accessToken, user, isRestoringSession } = useAuth();

  if (isRestoringSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Loading session…</p>
      </div>
    );
  }

  if (!accessToken) return <Navigate to={ROUTES.LOGIN} replace />;
  if (user?.role !== 'ADMIN') return <Navigate to={ROUTES.HOME} replace />;
  return <Outlet />;
}

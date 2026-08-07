import { useAuthStore } from '@/store/auth.store';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { ROUTES } from '@/constants';
import type { LoginCredentials, User } from '@/types';

export function useAuth() {
  const { accessToken, user, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const login = async (credentials: LoginCredentials) => {
    const { data } = await api.post<{ user: User; accessToken: string }>(
      '/auth/login',
      credentials
    );
    setAuth(data.accessToken, data.user);
    navigate(ROUTES.HOME);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Best-effort: even if this call fails (network issue, cookie already
      // gone), the user should still end up logged out locally — the
      // backend's own logout is idempotent for the same reason.
    } finally {
      clearAuth();
      navigate(ROUTES.LOGIN);
    }
  };

  return { user, accessToken, isAuthenticated: !!accessToken, login, logout };
}

//Why logout now hits the backend at all:
//  before this, clicking "log out" only cleared local state — the refresh token's DB row (and its httpOnly cookie) stayed valid server-side, so a captured cookie would keep working even after the user thought they'd logged out.
//  Now it actually revokes the session.
//  Why it's wrapped in try/catch rather than letting a failed call block logout:
// a flaky network shouldn't be able to trap a user in a "logged in" state they're actively trying to leave — local logout always succeeds regardless of whether the server round-trip does.

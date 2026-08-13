import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/useLogout';
import type { User } from '@/types';

function persistHasHydrated(): boolean {
  const persistApi = useAuthStore.persist;
  if (!persistApi?.hasHydrated) return true;
  return persistApi.hasHydrated();
}

export function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const [hasHydrated, setHasHydrated] = useState(persistHasHydrated);
  const logoutMutation = useLogout();

  useEffect(() => {
    const persistApi = useAuthStore.persist;
    if (!persistApi?.onFinishHydration) return;
    if (persistApi.hasHydrated?.()) return;
    return persistApi.onFinishHydration(() => setHasHydrated(true));
  }, []);

  useEffect(() => {
    if (!hasHydrated || !accessToken || user) return;

    let cancelled = false;
    api
      .get<User>('/auth/me')
      .then(({ data }) => {
        if (cancelled) return;
        if (data) {
          useAuthStore.getState().setAuth(accessToken, data);
        } else {
          useAuthStore.getState().clearAuth();
        }
      })
      .catch(() => {
        if (!cancelled) useAuthStore.getState().clearAuth();
      });

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, accessToken, user]);

  return {
    accessToken,
    user,
    // Token without a user means persist just hydrated or /auth/me is in flight.
    isRestoringSession: !hasHydrated || Boolean(accessToken && !user),
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
}

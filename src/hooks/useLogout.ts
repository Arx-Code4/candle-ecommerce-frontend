// src/hooks/useLogout.ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants';
import type { AxiosError } from 'axios';

export function useLogout() {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();

  return useMutation<null, AxiosError, void>({
    mutationFn: async () => {
      try {
        await api.post('/auth/logout');
        return null;
      } finally {
        // Local logout always happens, regardless of API success/failure.
        clearAuth();
        navigate(ROUTES.LOGIN);
      }
    },
  });
}

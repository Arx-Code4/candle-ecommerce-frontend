// src/hooks/useLogin.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { getSafeRedirectPath } from '@/lib/redirect';
import { ROUTES, QUERY_KEYS } from '@/constants';
import type { AxiosError } from 'axios';
import type { User } from '@/types';

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  cartItemAdded?: boolean;
}

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  return useMutation<LoginResponse, AxiosError, LoginFormValues>({
    mutationFn: async (values) => {
      const pendingVariantId = searchParams.get('pendingVariantId');

      const payload = { ...values };
      if (pendingVariantId) {
        Object.assign(payload, { pendingVariantId });
      }

      const { data } = await api.post<LoginResponse>('/auth/login', payload);
      return data;
    },
    onSuccess: (data) => {
      if (!data.accessToken) {
        throw new Error('Invalid response: missing access token');
      }

      setAuth(data.accessToken, data.user);

      if (data.cartItemAdded) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
      }

      // Role-aware redirect
      if (data.user.role === 'ADMIN') {
        navigate(ROUTES.ADMIN_DASHBOARD);
        return;
      }

      // Non-admin: use redirect param with safe fallback
      let safeRedirect: string;
      try {
        const redirectParam = searchParams.get('redirect');
        safeRedirect = getSafeRedirectPath(redirectParam, ROUTES.HOME);
      } catch {
        safeRedirect = ROUTES.HOME;
      }
      navigate(safeRedirect);
    },
  });
}

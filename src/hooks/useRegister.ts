// src/hooks/useRegister.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { getSafeRedirectPath } from '@/lib/redirect';
import { ROUTES, QUERY_KEYS } from '@/constants';
import type { AxiosError } from 'axios';
import type { User } from '@/types';

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  user: User;
  accessToken: string;
  cartItemAdded?: boolean;
}

export function useRegister() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  return useMutation<RegisterResponse, AxiosError, RegisterFormValues>({
    mutationFn: async (values) => {
      const pendingVariantId = searchParams.get('pendingVariantId');

      const payload = { ...values };
      if (pendingVariantId) {
        Object.assign(payload, { pendingVariantId });
      }

      const { data } = await api.post<RegisterResponse>('/auth/register', payload);
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

      // 🔁 Catch any error from getSafeRedirectPath and fall back to HOME
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

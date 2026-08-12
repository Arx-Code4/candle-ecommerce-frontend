// src/hooks/useForgotPassword.ts

import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import api from '@/lib/axios';

export function useForgotPassword() {
  return useMutation<null, AxiosError, { email: string }>({
    mutationFn: async ({ email }) => {
      await api.post('/auth/forgot-password', { email });

      return null;
    },
  });
}

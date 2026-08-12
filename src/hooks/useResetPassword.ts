// src/hooks/useResetPassword.ts
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { AxiosError } from 'axios';

export function useResetPassword() {
  return useMutation<null, AxiosError, { token: string; newPassword: string }>({
    mutationFn: ({ token, newPassword }) =>
      api.post('/auth/reset-password', { token, newPassword }).then(() => null),
  });
}

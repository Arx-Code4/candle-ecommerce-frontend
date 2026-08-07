import { useMutation } from '@tanstack/react-query';
import type { LoginCredentials, User } from '@/types';

interface LoginResponse {
  user: User;
  accessToken: string;
  cartItemAdded: boolean;
}

export function useLogin() {
  return useMutation<LoginResponse, unknown, LoginCredentials>({
    mutationFn: async () => {
      throw new Error('useLogin: not implemented yet');
    },
  });
}

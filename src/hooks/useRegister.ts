import { useMutation } from '@tanstack/react-query';
import type { RegisterCredentials, User } from '@/types';

interface RegisterResponse {
  user: User;
  accessToken: string;
  cartItemAdded: boolean;
}

export function useRegister() {
  return useMutation<RegisterResponse, unknown, RegisterCredentials>({
    mutationFn: async () => {
      throw new Error('useRegister: not implemented yet');
    },
  });
}

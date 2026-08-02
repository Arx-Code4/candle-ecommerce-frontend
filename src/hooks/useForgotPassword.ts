import { useMutation } from '@tanstack/react-query';
import type { ForgotPasswordPayload } from '@/types';

export function useForgotPassword() {
  return useMutation<null, unknown, ForgotPasswordPayload>({
    mutationFn: async () => {
      throw new Error('useForgotPassword: not implemented yet');
    },
  });
}

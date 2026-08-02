import { useMutation } from '@tanstack/react-query';
import type { ResetPasswordPayload } from '@/types';

export function useResetPassword() {
  return useMutation<null, unknown, ResetPasswordPayload>({
    mutationFn: async () => {
      throw new Error('useResetPassword: not implemented yet');
    },
  });
}

import { useMutation } from '@tanstack/react-query';

export function useLogout() {
  return useMutation<void, unknown, void>({
    mutationFn: async () => {
      throw new Error('useLogout: not implemented yet');
    },
  });
}

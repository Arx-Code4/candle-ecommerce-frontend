import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import type { CartMutationResult, UpdateCartItemPayload } from '@/types';

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation<CartMutationResult, unknown, UpdateCartItemPayload>({
    mutationFn: async () => {
      throw new Error('useUpdateCartItem: not implemented yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
    },
  });
}

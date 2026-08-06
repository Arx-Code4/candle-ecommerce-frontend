import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import type { AddCartItemPayload, CartMutationResult } from '@/types';

export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation<CartMutationResult, unknown, AddCartItemPayload>({
    mutationFn: async () => {
      throw new Error('useAddCartItem: not implemented yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
    },
  });
}

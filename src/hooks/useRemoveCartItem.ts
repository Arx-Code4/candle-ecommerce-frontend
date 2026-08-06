import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import type { Cart, RemoveCartItemPayload } from '@/types';

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation<Pick<Cart, 'total'> & { cartTotal?: string }, unknown, RemoveCartItemPayload>({
    mutationFn: async () => {
      throw new Error('useRemoveCartItem: not implemented yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
    },
  });
}

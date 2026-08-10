// src/hooks/useUpdateCartItem.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import type { CartMutationResult, UpdateCartItemPayload } from '@/types';

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation<CartMutationResult, AxiosError, UpdateCartItemPayload>({
    mutationFn: async ({ itemId, quantity }) => {
      const response = await api.patch(`/cart/items/${itemId}`, { quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
    },
  });
}

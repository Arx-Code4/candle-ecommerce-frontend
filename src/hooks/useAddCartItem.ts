// src/hooks/useAddCartItem.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import type { AddCartItemPayload, CartMutationResult } from '@/types';

export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation<CartMutationResult, AxiosError, AddCartItemPayload>({
    mutationFn: async ({ productVariantId, quantity }) => {
      const response = await api.post('/cart/items', { productVariantId, quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
    },
  });
}

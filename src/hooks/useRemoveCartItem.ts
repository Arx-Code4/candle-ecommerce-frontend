// src/hooks/useRemoveCartItem.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import type { RemoveCartItemPayload } from '@/types';

interface RemoveCartItemResult {
  cartTotal: string;
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation<RemoveCartItemResult, AxiosError, RemoveCartItemPayload>({
    mutationFn: async ({ itemId }) => {
      const response = await api.delete(`/cart/items/${itemId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
    },
  });
}

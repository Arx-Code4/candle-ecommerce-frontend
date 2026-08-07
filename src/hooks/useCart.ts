// src/hooks/useCart.ts
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';

export interface CartItem {
  id: string;
  available: boolean;
}

export interface CartData {
  items: CartItem[];
  total: string;
}

// Export a type that matches what the tests expect
export type UseCartResult = ReturnType<typeof useCart>;

export function useCart() {
  return useQuery<CartData, AxiosError>({
    queryKey: [QUERY_KEYS.CART],
    queryFn: async () => {
      const response = await api.get('/cart');
      return response.data;
    },
  });
}

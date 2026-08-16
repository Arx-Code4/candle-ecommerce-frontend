// src/hooks/useOrders.ts
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import type { OrderSummary } from '@/types';

export interface OrdersResponse {
  items: OrderSummary[];
}

export function useOrders() {
  return useQuery<OrdersResponse, AxiosError>({
    queryKey: [QUERY_KEYS.ORDERS],
    queryFn: async () => {
      const response = await api.get('/orders');
      return response.data;
    },
  });
}

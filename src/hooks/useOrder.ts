// src/hooks/useOrder.ts
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import type { OrderDetail } from '@/types';

export function useOrder(orderId: string) {
  return useQuery<OrderDetail, AxiosError>({
    queryKey: [QUERY_KEYS.ORDERS, orderId],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    },
  });
}

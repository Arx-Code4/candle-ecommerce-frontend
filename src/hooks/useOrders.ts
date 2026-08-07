// src/hooks/useOrders.ts
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';

export interface OrderListItem {
  id: string;
  status: string;
  totalAmount: string;
  itemCount: number;
  createdAt: string;
}

export interface OrdersResponse {
  items: OrderListItem[];
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

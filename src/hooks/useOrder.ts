// src/hooks/useOrder.ts
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';

export interface OrderItem {
  productNameSnapshot: string;
  scentSnapshot: string;
  sizeSnapshot: string;
  unitPriceSnapshot: string;
  quantity: number;
}

export interface OrderDetail {
  id: string;
  status: string;
  totalAmount: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  createdAt: string;
}

export function useOrder(orderId: string) {
  return useQuery<OrderDetail, AxiosError>({
    queryKey: [QUERY_KEYS.ORDERS, orderId],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    },
  });
}

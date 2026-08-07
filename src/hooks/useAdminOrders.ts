import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import type { Order, OrderStatus, PaginatedResult } from '@/types';

interface AdminOrdersParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export function useAdminOrders(params: AdminOrdersParams = {}) {
  return useQuery<PaginatedResult<Order>>({
    queryKey: [QUERY_KEYS.ADMIN_ORDERS, params],
    queryFn: async () => {
      throw new Error('useAdminOrders: not implemented yet');
    },
  });
}

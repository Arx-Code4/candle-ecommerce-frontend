import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import type { AdminOrderSummary, OrderStatus, PaginatedResult } from '@/types';

interface AdminOrdersParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export function useAdminOrders(params: AdminOrdersParams = {}) {
  return useQuery<PaginatedResult<AdminOrderSummary>>({
    queryKey: [QUERY_KEYS.ADMIN_ORDERS, params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResult<AdminOrderSummary>>('/admin/orders', {
        params,
      });
      return data;
    },
  });
}

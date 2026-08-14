import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import type { AdminProductSummary, PaginatedResult } from '@/types';

interface AdminProductsParams {
  page?: number;
  limit?: number;
}

function sanitizeParams(params: AdminProductsParams): AdminProductsParams {
  const next: AdminProductsParams = {};
  if (params.page !== undefined) next.page = params.page < 1 ? 1 : params.page;
  if (params.limit !== undefined) next.limit = params.limit < 1 ? 20 : params.limit;
  return next;
}

export function useAdminProducts(params: AdminProductsParams = {}) {
  const queryParams = sanitizeParams(params);

  return useQuery<PaginatedResult<AdminProductSummary>>({
    queryKey: [QUERY_KEYS.ADMIN_PRODUCTS, queryParams],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResult<AdminProductSummary>>('/admin/products', {
        params: queryParams,
      });
      return data;
    },
  });
}

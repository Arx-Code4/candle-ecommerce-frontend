import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import type { Product, PaginatedResult } from '@/types';

interface AdminProductsParams {
  page?: number;
  limit?: number;
}

export function useAdminProducts(params: AdminProductsParams = {}) {
  return useQuery<PaginatedResult<Product>>({
    queryKey: [QUERY_KEYS.ADMIN_PRODUCTS, params],
    queryFn: async () => {
      throw new Error('useAdminProducts: not implemented yet');
    },
  });
}

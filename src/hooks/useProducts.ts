import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import type { PaginatedResult, Product, ProductFilters } from '@/types';

export function useProducts(filters: ProductFilters = {}) {
  return useQuery<PaginatedResult<Product>>({
    queryKey: [QUERY_KEYS.PRODUCTS, filters],
    queryFn: async () => {
      throw new Error('useProducts: not implemented yet');
    },
  });
}

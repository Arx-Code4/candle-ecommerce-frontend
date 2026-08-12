import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import type { PaginatedResult, Product, ProductFilters } from '@/types';

export function useProducts(filters?: ProductFilters) {
  return useQuery<PaginatedResult<Product>>({
    queryKey: [QUERY_KEYS.PRODUCTS, filters],
    queryFn: () =>
      api.get<PaginatedResult<Product>>('/products', { params: filters }).then((r) => r.data),
  });
}

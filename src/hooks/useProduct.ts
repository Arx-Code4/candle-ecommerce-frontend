import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import type { Product } from '@/types';

export function useProduct(id: string) {
  return useQuery<Product>({
    queryKey: [QUERY_KEYS.PRODUCTS, id],
    queryFn: async () => {
      throw new Error('useProduct: not implemented yet');
    },
  });
}

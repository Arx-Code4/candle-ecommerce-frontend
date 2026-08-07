import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import type { Product } from '@/types';

export function useAdminProduct(id: string | undefined) {
  return useQuery<Product>({
    queryKey: [QUERY_KEYS.ADMIN_PRODUCTS, id],
    enabled: Boolean(id), // never fires in create mode, where id is undefined
    queryFn: async () => {
      throw new Error('useAdminProduct: not implemented yet ');
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import type { Product, ProductFormInput } from '@/types';

interface UpdateProductArgs {
  id: string;
  data: Partial<ProductFormInput>;
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation<Product, unknown, UpdateProductArgs>({
    mutationFn: async () => {
      throw new Error('useUpdateProduct: not implemented yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_PRODUCTS] });
    },
  });
}

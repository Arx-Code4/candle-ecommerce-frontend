import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import type { Product, ProductFormInput } from '@/types';

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation<Product, unknown, ProductFormInput>({
    mutationFn: async () => {
      throw new Error('useCreateProduct: not implemented yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_PRODUCTS] });
    },
  });
}

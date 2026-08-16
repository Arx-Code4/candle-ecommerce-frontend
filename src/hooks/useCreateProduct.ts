import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postForm } from '@/lib/axios';
import { buildProductFormData } from '@/lib/productFormData';
import { QUERY_KEYS } from '@/constants';
import type { Product, ProductFormInput } from '@/types';

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation<Product, unknown, ProductFormInput>({
    mutationFn: async (input) => {
      const formData = buildProductFormData(input);
      const response = await postForm<Product>('/admin/products', formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_PRODUCTS] });
    },
  });
}

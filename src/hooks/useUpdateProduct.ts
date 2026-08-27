import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchForm } from '@/lib/axios';
import { buildProductFormData } from '@/lib/productFormData';
import { QUERY_KEYS } from '@/constants';
import type { Product, ProductFormInput } from '@/types';

interface UpdateProductArgs {
  id: string;
  data: Partial<ProductFormInput>;
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation<Product, unknown, UpdateProductArgs>({
    mutationFn: async ({ id, data }) => {
      const formData = buildProductFormData(data);
      const response = await patchForm<Product>(`/admin/products/${id}`, formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_PRODUCTS] });
    },
  });
}

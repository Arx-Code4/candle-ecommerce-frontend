import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import type { AdminProductFormValues, AdminProductSummary } from '@/types';

export function useCreateAdminProduct() {
  const queryClient = useQueryClient();

  return useMutation<AdminProductSummary, unknown, AdminProductFormValues>({
    mutationFn: async (values) => {
      const { data } = await api.post<AdminProductSummary>('/admin/products', values);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_PRODUCTS] });
    },
  });
}

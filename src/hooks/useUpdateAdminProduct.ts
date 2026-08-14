import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import type { AdminProductFormValues, AdminProductSummary } from '@/types';

export type UpdateAdminProductInput = AdminProductFormValues & { id: string };

export function useUpdateAdminProduct() {
  const queryClient = useQueryClient();

  return useMutation<AdminProductSummary, unknown, UpdateAdminProductInput>({
    mutationFn: async ({ id, ...values }) => {
      const { data } = await api.patch<AdminProductSummary>(`/admin/products/${id}`, values);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_PRODUCTS] });
    },
  });
}

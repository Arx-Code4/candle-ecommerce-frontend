import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';

interface UpdateProductStatusArgs {
  id: string;
  isPublished: boolean;
}

export function useUpdateProductStatus() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string; isPublished: boolean }, unknown, UpdateProductStatusArgs>({
    mutationFn: async () => {
      throw new Error('useUpdateProductStatus: not implemented yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_PRODUCTS] });
    },
  });
}

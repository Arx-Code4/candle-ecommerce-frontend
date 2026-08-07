// src/hooks/useUpdateOrderStatus.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';

interface UpdateOrderStatusArgs {
  id: string;
  status: 'SHIPPED';
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string; status: string }, unknown, UpdateOrderStatusArgs>({
    mutationFn: async () => {
      throw new Error('useUpdateOrderStatus: not implemented yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_ORDERS] });
    },
  });
}

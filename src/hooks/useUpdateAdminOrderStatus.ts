import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';

interface UpdateAdminOrderStatusArgs {
  id: string;
  status: 'SHIPPED';
}

export function useUpdateAdminOrderStatus() {
  const queryClient = useQueryClient();
  const inFlight = useRef(false);

  const mutation = useMutation<{ id: string; status: string }, unknown, UpdateAdminOrderStatusArgs>(
    {
      mutationFn: async ({ id, status }) => {
        const { data } = await api.patch<{ id: string; status: string }>(
          `/admin/orders/${id}/status`,
          { status }
        );
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_ORDERS] });
      },
      onSettled: () => {
        inFlight.current = false;
      },
    }
  );

  const mutate: typeof mutation.mutate = (variables, options) => {
    if (inFlight.current) return;
    inFlight.current = true;
    mutation.mutate(variables, options);
  };

  return { ...mutation, mutate };
}

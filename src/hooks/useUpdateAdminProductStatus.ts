import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';

interface UpdateAdminProductStatusArgs {
  id: string;
  isPublished: boolean;
}

export function useUpdateAdminProductStatus() {
  const queryClient = useQueryClient();
  const inFlight = useRef(false);

  const mutation = useMutation<
    { id: string; isPublished: boolean },
    unknown,
    UpdateAdminProductStatusArgs
  >({
    mutationFn: async ({ id, isPublished }) => {
      const { data } = await api.patch<{ id: string; isPublished: boolean }>(
        `/admin/products/${id}/status`,
        { isPublished }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_PRODUCTS] });
    },
    onSettled: () => {
      inFlight.current = false;
    },
  });

  const mutate: typeof mutation.mutate = (variables, options) => {
    if (inFlight.current) return;
    inFlight.current = true;
    mutation.mutate(variables, options);
  };

  return { ...mutation, mutate };
}

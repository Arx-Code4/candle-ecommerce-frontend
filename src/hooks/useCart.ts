import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import { useAuthStore } from '@/store/auth.store';
import type { Cart } from '@/types';

export function useCart() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery<Cart, AxiosError>({
    queryKey: [QUERY_KEYS.CART],
    queryFn: async () => {
      const response = await api.get('/cart');
      return response.data;
    },
    enabled: !!accessToken,
  });
}

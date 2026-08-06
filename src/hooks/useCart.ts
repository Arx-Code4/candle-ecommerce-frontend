import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import { useAuthStore } from '@/store/auth.store';
import type { Cart } from '@/types';

export function useCart() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery<Cart>({
    queryKey: [QUERY_KEYS.CART],
    enabled: !!accessToken,
    queryFn: async () => {
      throw new Error('useCart: not implemented yet');
    },
  });
}

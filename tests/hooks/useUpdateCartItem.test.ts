import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUpdateCartItem } from '@/hooks/useUpdateCartItem';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import { createQueryWrapper } from '../test-utils';
import type { CartMutationResult } from '@/types';

vi.mock('@/lib/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const itemId = 'item-1';

describe('useUpdateCartItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls PATCH /cart/items/:itemId', async () => {
    vi.mocked(api.patch).mockResolvedValue({
      data: { cartTotal: '75.00', wasCapped: false },
    });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUpdateCartItem(), { wrapper: Wrapper });

    result.current.mutate({ itemId, quantity: 3 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.patch).toHaveBeenCalledWith(`/cart/items/${itemId}`, { quantity: 3 });
  });

  it('invalidates CART on success', async () => {
    vi.mocked(api.patch).mockResolvedValue({
      data: { cartTotal: '75.00', wasCapped: false },
    });
    const { Wrapper, queryClient } = createQueryWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useUpdateCartItem(), { wrapper: Wrapper });

    result.current.mutate({ itemId, quantity: 3 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [QUERY_KEYS.CART] });
  });

  it('exposes the same wasCapped/cappedTo shape as useAddCartItem', async () => {
    const response: CartMutationResult = {
      cartTotal: '50.00',
      wasCapped: true,
      cappedTo: 5,
    };
    vi.mocked(api.patch).mockResolvedValue({ data: response });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUpdateCartItem(), { wrapper: Wrapper });

    result.current.mutate({ itemId, quantity: 10 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.wasCapped).toBe(true);
    expect(result.current.data?.cappedTo).toBe(5);
  });
});

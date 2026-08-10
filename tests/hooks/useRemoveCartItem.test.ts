import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRemoveCartItem } from '@/hooks/useRemoveCartItem';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import { createQueryWrapper } from '../test-utils';

vi.mock('@/lib/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const itemId = 'item-1';

describe('useRemoveCartItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls DELETE /cart/items/:itemId', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { cartTotal: '0.00' } });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useRemoveCartItem(), { wrapper: Wrapper });

    result.current.mutate({ itemId });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.delete).toHaveBeenCalledWith(`/cart/items/${itemId}`);
  });

  it('invalidates CART on success', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { cartTotal: '0.00' } });
    const { Wrapper, queryClient } = createQueryWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRemoveCartItem(), { wrapper: Wrapper });

    result.current.mutate({ itemId });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [QUERY_KEYS.CART] });
  });

  it('error state on failure', async () => {
    vi.mocked(api.delete).mockRejectedValue(new Error('network'));
    const { Wrapper, queryClient } = createQueryWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRemoveCartItem(), { wrapper: Wrapper });

    result.current.mutate({ itemId });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import { useAddCartItem } from '@/hooks/useAddCartItem';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import { createQueryWrapper } from '../test-utils';
import type { CartMutationResult } from '@/types';

vi.mock('@/lib/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const productVariantId = 'variant-1';

describe.skip('useAddCartItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls POST /cart/items', async () => {
    const response: CartMutationResult = {
      cartTotal: '50.00',
      wasCapped: false,
    };
    vi.mocked(api.post).mockResolvedValue({ data: response });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAddCartItem(), { wrapper: Wrapper });

    result.current.mutate({ productVariantId, quantity: 2 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.post).toHaveBeenCalledWith('/cart/items', {
      productVariantId,
      quantity: 2,
    });
  });

  it('invalidates CART on success', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { cartTotal: '50.00', wasCapped: false },
    });
    const { Wrapper, queryClient } = createQueryWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAddCartItem(), { wrapper: Wrapper });

    result.current.mutate({ productVariantId, quantity: 1 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [QUERY_KEYS.CART] });
  });

  it('hook does not hardcode toast copy', async () => {
    const response: CartMutationResult = {
      cartTotal: '50.00',
      wasCapped: true,
      cappedTo: 3,
      message: 'Only 3 left — quantity adjusted',
    };
    vi.mocked(api.post).mockResolvedValue({ data: response });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAddCartItem(), { wrapper: Wrapper });

    result.current.mutate({ productVariantId, quantity: 10 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(response);
  });

  it('409 out-of-stock race surfaces via normal error state', async () => {
    const error = new AxiosError('Conflict');
    error.response = {
      status: 409,
      data: {},
      statusText: 'Conflict',
      headers: {},
      config: {} as never,
    };
    vi.mocked(api.post).mockRejectedValue(error);
    const { Wrapper, queryClient } = createQueryWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAddCartItem(), { wrapper: Wrapper });

    result.current.mutate({ productVariantId, quantity: 1 });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});


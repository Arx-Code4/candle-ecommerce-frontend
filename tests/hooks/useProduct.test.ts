import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import { useProduct } from '@/hooks/useProduct';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import { createQueryWrapper } from '../test-utils';
import type { Product } from '@/types';

vi.mock('@/lib/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const mockProduct: Product = {
  id: 'p1',
  name: 'Vanilla Candle',
  description: 'Warm vanilla',
  price: 25,
  isPublished: true,
  primaryPhotoUrl: 'jjj',
  photos: [],
  variants: [],
};

describe('useProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches by id', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockProduct });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useProduct('p1'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/products/p1');
  });

  it('query key is scoped by id', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockProduct });
    const { Wrapper, queryClient } = createQueryWrapper();

    const { result, rerender } = renderHook((id: string) => useProduct(id), {
      wrapper: Wrapper,
      initialProps: 'p1',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData([QUERY_KEYS.PRODUCTS, 'p1'])).toBeDefined();

    rerender('p2');
    await waitFor(() => {
      expect(queryClient.getQueryData([QUERY_KEYS.PRODUCTS, 'p2'])).toBeDefined();
    });
    expect(queryClient.getQueryData([QUERY_KEYS.PRODUCTS, 'p1'])).toBeDefined();
  });

  it('404 surfaces as an error state', async () => {
    const error = new AxiosError('Not Found');
    error.response = {
      status: 404,
      data: {},
      statusText: 'Not Found',
      headers: {},
      config: {} as never,
    };
    vi.mocked(api.get).mockRejectedValue(error);

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useProduct('missing'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
    expect((result.current.error as AxiosError).response?.status).toBe(404);
  });
});

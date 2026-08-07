import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProducts } from '@/hooks/useProducts';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import { createQueryWrapper } from '../test-utils';
import type { PaginatedResult, Product } from '@/types';

vi.mock('@/lib/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const mockPage: PaginatedResult<Product> = {
  items: [],
  page: 2,
  limit: 20,
  total: 0,
};

describe.skip('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches with the given filters', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPage });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(
      () => useProducts({ scent: 'vanilla', page: 2, limit: 20 }),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/products', {
      params: { scent: 'vanilla', page: 2, limit: 20 },
    });
  });

  it('query key includes the filters object', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPage });
    const { Wrapper, queryClient } = createQueryWrapper();

    const { result, rerender } = renderHook(
      (filters: { scent?: string }) => useProducts(filters),
      { wrapper: Wrapper, initialProps: { scent: 'vanilla' } }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData([QUERY_KEYS.PRODUCTS, { scent: 'vanilla' }])).toBeDefined();

    rerender({ scent: 'lavender' });
    await waitFor(() => {
      expect(queryClient.getQueryData([QUERY_KEYS.PRODUCTS, { scent: 'lavender' }])).toBeDefined();
    });
    expect(queryClient.getQueryData([QUERY_KEYS.PRODUCTS, { scent: 'vanilla' }])).toBeDefined();
  });

  it('no filters passed still resolves', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPage });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useProducts(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/products', { params: undefined });
  });

  it('surfaces an error state on failure', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('network'));
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useProducts(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});


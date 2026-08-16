import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import api from '@/lib/axios';
import { useOrders } from '@/hooks/useOrders';
import { QUERY_KEYS } from '@/constants';

vi.mock('@/lib/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
const mockedGet = vi.mocked(api.get);

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useOrders', () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it('fetches the order list from GET /orders', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        items: [
          {
            id: '1',
            status: 'PROCESSING',
            totalAmount: '900.00',
            itemCount: 2,
            createdAt: '2026-07-01T10:00:00.000Z',
          },
        ],
      },
    });

    const { result } = renderHook(() => useOrders(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedGet).toHaveBeenCalledWith('/orders');
  });

  it('uses a query key with no params', async () => {
    mockedGet.mockResolvedValueOnce({ data: { items: [] } });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    function localWrapper({ children }: { children: ReactNode }) {
      return createElement(QueryClientProvider, { client: queryClient }, children);
    }

    const { result } = renderHook(() => useOrders(), { wrapper: localWrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cacheEntry = queryClient.getQueryData([QUERY_KEYS.ORDERS]);
    expect(cacheEntry).toBeDefined();
  });

  it('resolves an empty order history without error', async () => {
    mockedGet.mockResolvedValueOnce({ data: { items: [] } });

    const { result } = renderHook(() => useOrders(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toEqual([]);
    expect(result.current.isError).toBe(false);
  });

  it('surfaces an error state on failure', async () => {
    mockedGet.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useOrders(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

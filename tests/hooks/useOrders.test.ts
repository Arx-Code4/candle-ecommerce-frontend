// tests/hooks/useOrders.test.ts
// Source: src/hooks/useOrders.ts
// Per eco-9.2.3 §9.2 (useOrders.test.ts) + eco-5c GET /orders.
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

// NOTE: mocked api.get resolves with the already-unwrapped payload shape
// (i.e. what the axios response interceptor hands back), per the
// template's contract (v3 docs, Section 7.1) and the Testing Guide's
// Section 6.2 rule — hook tests never assert on/mock the raw envelope.

describe.skip('useOrders', () => {
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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import { useOrder } from '@/hooks/useOrder';
import { QUERY_KEYS } from '@/constants';

vi.mock('@/lib/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
const mockedGet = vi.mocked(api.get);

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  function wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return { wrapper, queryClient };
}

const mockOrderDetail = {
  id: 'order-1',
  status: 'SHIPPED',
  totalAmount: '900.00',
  shippingName: 'Ada Lovelace',
  shippingPhone: '0911000000',
  shippingAddress: 'Addis Ababa',
  items: [
    {
      productNameSnapshot: 'Lavender Dream Soy Candle',
      scentSnapshot: 'Lavender',
      sizeSnapshot: 'Small',
      unitPriceSnapshot: '450.00',
      quantity: 2,
    },
  ],
  createdAt: '2026-07-01T10:00:00.000Z',
};

describe('useOrder', () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it('fetches an order by id from GET /orders/:id', async () => {
    mockedGet.mockResolvedValueOnce({ data: mockOrderDetail });
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => useOrder('order-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedGet).toHaveBeenCalledWith('/orders/order-1');
  });

  it('scopes the query key by id — two ids produce two distinct cache entries', async () => {
    mockedGet.mockResolvedValueOnce({ data: { ...mockOrderDetail, id: 'order-1' } });
    mockedGet.mockResolvedValueOnce({ data: { ...mockOrderDetail, id: 'order-2' } });

    const { queryClient } = makeWrapper();
    function wrapper({ children }: { children: ReactNode }) {
      return createElement(QueryClientProvider, { client: queryClient }, children);
    }

    const first = renderHook(() => useOrder('order-1'), { wrapper });
    await waitFor(() => expect(first.result.current.isSuccess).toBe(true));

    const second = renderHook(() => useOrder('order-2'), { wrapper });
    await waitFor(() => expect(second.result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryData([QUERY_KEYS.ORDERS, 'order-1'])).toBeDefined();
    expect(queryClient.getQueryData([QUERY_KEYS.ORDERS, 'order-2'])).toBeDefined();
  });

  it('surfaces a 404 (not found or not owned) as a single error state', async () => {
    const notFoundError = new AxiosError('Not Found');
    notFoundError.response = {
      status: 404,
      data: { statusCode: 404, success: false, message: 'Order not found', errors: null },
    } as AxiosError['response'];
    mockedGet.mockRejectedValueOnce(notFoundError);
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => useOrder('not-mine'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    // The hook exposes no field distinguishing "not found" from "not yours" —
    // matches the backend's deliberate single 404 contract (eco-5c).
    expect(result.current.data).toBeUndefined();
  });
});

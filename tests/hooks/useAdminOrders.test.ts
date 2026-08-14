import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import api from '@/lib/axios';
import { createQueryWrapper } from '../test-utils';
import type { Order, PaginatedResult } from '@/types';

vi.mock('@/lib/axios');

const mockResult: PaginatedResult<Order> = { items: [], page: 1, limit: 20, total: 0 };

describe('useAdminOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /admin/orders with no status filter by default', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockResult });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAdminOrders(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/admin/orders', { params: {} });
  });

  it('passes the status filter through as a query param', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockResult });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAdminOrders({ status: 'SHIPPED' }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/admin/orders', { params: { status: 'SHIPPED' } });
  });

  it('passes page and limit through as query params', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockResult });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAdminOrders({ page: 2, limit: 5 }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/admin/orders', { params: { page: 2, limit: 5 } });
  });

  it('surfaces a fetch failure', async () => {
    const mockError = { isAxiosError: true, response: { status: 500 } };
    vi.mocked(api.get).mockRejectedValue(mockError);
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAdminOrders(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(mockError);
  });

  // ADDED – when the component re-renders with new filter/page/limit,
  // React Query refetches automatically. This test ensures the hook
  // fires a second API call with the updated params, not stale ones.
  it('refetches with new params when props change', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockResult });
    const { Wrapper } = createQueryWrapper();

    // Use the hook’s actual parameter type – prevents narrowing to literal types
    type Params = Parameters<typeof useAdminOrders>[0];

    const initialProps: Params = { status: 'PROCESSING', page: 1, limit: 10 };
    const { result, rerender } = renderHook((props: Params) => useAdminOrders(props), {
      wrapper: Wrapper,
      initialProps,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/admin/orders', {
      params: { status: 'PROCESSING', page: 1, limit: 10 },
    });

    // Now `rerender` accepts any AdminOrdersParams, including SHIPPED
    rerender({ status: 'SHIPPED', page: 2, limit: 20 });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
      expect(api.get).toHaveBeenLastCalledWith('/admin/orders', {
        params: { status: 'SHIPPED', page: 2, limit: 20 },
      });
    });
  });
});

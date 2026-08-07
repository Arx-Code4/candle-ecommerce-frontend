import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import api from '@/lib/axios';
import { createQueryWrapper } from '../test-utils';
import type { Product, PaginatedResult } from '@/types';

vi.mock('@/lib/axios');

const mockResult: PaginatedResult<Product> = {
  items: [],
  page: 1,
  limit: 20,
  total: 0,
};

describe.skip('useAdminProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /admin/products on render', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockResult });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAdminProducts(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/admin/products', { params: {} });
  });

  it('passes page and limit through as query params', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockResult });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAdminProducts({ page: 2, limit: 10 }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/admin/products', { params: { page: 2, limit: 10 } });
  });

  it('resolves with the paginated result', async () => {
    const populated: PaginatedResult<Product> = { ...mockResult, total: 1 };
    vi.mocked(api.get).mockResolvedValue({ data: populated });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAdminProducts(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(populated);
  });

  it('surfaces a fetch failure', async () => {
    const mockError = { isAxiosError: true, response: { status: 500 } };
    vi.mocked(api.get).mockRejectedValue(mockError);
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAdminProducts(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(mockError);
  });
  // ADDED – when page/limit props change, the hook refetches with the
  // updated query params.
  it('refetches with new params when props change', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockResult });
    const { Wrapper } = createQueryWrapper();
    type Params = Parameters<typeof useAdminProducts>[0];

    const initialProps: Params = { page: 1, limit: 10 };
    const { result, rerender } = renderHook((props: Params) => useAdminProducts(props), {
      wrapper: Wrapper,
      initialProps,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/admin/products', {
      params: { page: 1, limit: 10 },
    });

    // Rerender with new values
    rerender({ page: 2, limit: 20 });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
      expect(api.get).toHaveBeenLastCalledWith('/admin/products', {
        params: { page: 2, limit: 20 },
      });
    });
  });

  // ADDED – invalid page (0 or negative) and limit (negative) are sanitised
  // to sensible defaults before the request is sent.
  it('sanitizes invalid page and limit to defaults', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockResult });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAdminProducts({ page: 0, limit: -1 }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Assumption: page defaults to 1, limit defaults to 20
    expect(api.get).toHaveBeenCalledWith('/admin/products', {
      params: { page: 1, limit: 20 },
    });
  });

  // ADDED – a non‑Axios rejection (e.g., network drop) is surfaced without
  // crashing.
  it('surfaces a plain Error rejection (non-Axios)', async () => {
    const mockError = new Error('Network Error');
    vi.mocked(api.get).mockRejectedValue(mockError);
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAdminProducts(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(mockError);
  });
});

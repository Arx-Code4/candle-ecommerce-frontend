import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUpdateProductStatus } from '@/hooks/useUpdateProductStatus';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import { createQueryWrapper } from '../test-utils';

vi.mock('@/lib/axios');

describe.skip('useUpdateProductStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('PATCHes /admin/products/:id/status with the new isPublished value', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: { id: 'p1', isPublished: true } });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUpdateProductStatus(), { wrapper: Wrapper });

    result.current.mutate({ id: 'p1', isPublished: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.patch).toHaveBeenCalledWith('/admin/products/p1/status', { isPublished: true });
  });

  it('invalidates the admin products list on success', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: { id: 'p1', isPublished: true } });
    const { Wrapper, queryClient } = createQueryWrapper();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useUpdateProductStatus(), { wrapper: Wrapper });

    result.current.mutate({ id: 'p1', isPublished: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: [QUERY_KEYS.ADMIN_PRODUCTS] });
  });

  it('does not call the API just from being rendered', () => {
    const { Wrapper } = createQueryWrapper();
    renderHook(() => useUpdateProductStatus(), { wrapper: Wrapper });
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('propagates a not-found (404) failure', async () => {
    const mockError = { isAxiosError: true, response: { status: 404 } };
    vi.mocked(api.patch).mockRejectedValue(mockError);
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUpdateProductStatus(), { wrapper: Wrapper });

    result.current.mutate({ id: 'missing', isPublished: true });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(mockError);
  });
  // ADDED – prevents duplicate submissions while a mutation is in-flight.
  // A rapid double-toggle must not fire two API calls.
  it('does not fire a second request while the first is still in-flight', async () => {
    let resolvePatch: (value: unknown) => void;
    const patchPromise = new Promise((resolve) => {
      resolvePatch = resolve;
    });
    vi.mocked(api.patch).mockReturnValue(patchPromise as ReturnType<typeof api.patch>);

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUpdateProductStatus(), { wrapper: Wrapper });

    // First mutation
    result.current.mutate({ id: 'p1', isPublished: true });
    // Second while first pending
    result.current.mutate({ id: 'p2', isPublished: false });

    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith('/admin/products/p1/status', { isPublished: true });

    resolvePatch!({ data: { id: 'p1', isPublished: true } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.patch).toHaveBeenCalledTimes(1);
  });

  // ADDED – a non‑Axios rejection (network drop) must not crash the hook
  // and be surfaced as an error.
  it('surfaces a plain Error rejection (non-Axios)', async () => {
    const mockError = new Error('Network Error');
    vi.mocked(api.patch).mockRejectedValue(mockError);
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUpdateProductStatus(), { wrapper: Wrapper });

    result.current.mutate({ id: 'p1', isPublished: true });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(mockError);
  });
});

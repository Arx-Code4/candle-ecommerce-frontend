import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUpdateOrderStatus } from '@/hooks/useUpdateOrderStatus';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import { createQueryWrapper } from '../test-utils';

vi.mock('@/lib/axios');

describe.skip('useUpdateOrderStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('PATCHes /admin/orders/:id/status with the new status', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: { id: 'o1', status: 'SHIPPED' } });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUpdateOrderStatus(), { wrapper: Wrapper });

    result.current.mutate({ id: 'o1', status: 'SHIPPED' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.patch).toHaveBeenCalledWith('/admin/orders/o1/status', { status: 'SHIPPED' });
  });

  it('invalidates the admin orders list on success', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: { id: 'o1', status: 'SHIPPED' } });
    const { Wrapper, queryClient } = createQueryWrapper();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useUpdateOrderStatus(), { wrapper: Wrapper });

    result.current.mutate({ id: 'o1', status: 'SHIPPED' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: [QUERY_KEYS.ADMIN_ORDERS] });
  });

  // ADDED — the backend explicitly 400s both a same-status transition and
  // any origin other than PROCESSING. Worth a dedicated case since it's a
  // real, named business rule (not a generic validation failure) and a
  // UI that just shows a generic error here would be misleading — the
  // page needs the real backend message, not a mangled one.
  it('propagates the backend\'s "Invalid status transition" message unmodified', async () => {
    const mockError = {
      isAxiosError: true,
      response: { status: 400, data: { message: 'Invalid status transition' } },
    };
    vi.mocked(api.patch).mockRejectedValue(mockError);
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUpdateOrderStatus(), { wrapper: Wrapper });

    result.current.mutate({ id: 'o1', status: 'SHIPPED' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({
      response: { data: { message: 'Invalid status transition' } },
    });
  });

  it('does not call the API just from being rendered', () => {
    const { Wrapper } = createQueryWrapper();
    renderHook(() => useUpdateOrderStatus(), { wrapper: Wrapper });
    expect(api.patch).not.toHaveBeenCalled();
  });
  // ADDED – ensures the hook does not fire a second request while one is
  // already in-flight. A loading guard (isLoading) prevents duplicate
  // submissions, which could cause conflicting status updates.
  it('does not fire a second request while the first is still in-flight', async () => {
    let resolvePatch: (value: unknown) => void;
    const patchPromise = new Promise((resolve) => {
      resolvePatch = resolve;
    });
    vi.mocked(api.patch).mockReturnValue(patchPromise as ReturnType<typeof api.patch>);

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUpdateOrderStatus(), { wrapper: Wrapper });

    // Fire the first mutation
    result.current.mutate({ id: 'o1', status: 'SHIPPED' });
    // Immediately fire a second while the first is pending (same status avoids TS narrowing)
    result.current.mutate({ id: 'o2', status: 'SHIPPED' });

    // Only one API call should have been made
    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith('/admin/orders/o1/status', { status: 'SHIPPED' });

    // Resolve the first call
    resolvePatch!({ data: { id: 'o1', status: 'SHIPPED' } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Still only one call – second mutation was suppressed
    expect(api.patch).toHaveBeenCalledTimes(1);
  });
});

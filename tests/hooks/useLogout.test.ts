import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLogout } from '@/hooks/useLogout';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { createQueryWrapper } from '../test-utils';

vi.mock('@/lib/axios');
vi.mock('@/store/auth.store');

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: vi.fn() };
});

describe.skip('useLogout', () => {
  const clearAuth = vi.fn();
  const navigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockImplementation((selector) =>
      selector({ clearAuth } as unknown as ReturnType<typeof useAuthStore.getState>)
    );
    vi.mocked(useNavigate).mockReturnValue(navigate);
  });

  it('calls POST /auth/logout when invoked', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: null });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.post).toHaveBeenCalledWith('/auth/logout');
  });

  it('clears local auth state and navigates to /login on success', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: null });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clearAuth).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(ROUTES.LOGIN);
  });

  // CRITICAL — this is the entire reason useLogout exists as a mutation
  // with onSettled rather than a plain try/catch: local logout must still
  // happen even when the server call fails (flaky network, cookie already
  // gone, whatever). A user clicking "log out" should never get stuck in a
  // logged-in-looking state just because one HTTP call didn't land.
  it('still clears local auth state and navigates to /login even when the API call fails', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('Network Error'));
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(clearAuth).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(ROUTES.LOGIN);
  });

  // ADDED — documents the deliberate design choice above: unlike
  // useForgotPassword/useResetPassword's error handling, a failed logout
  // call is still visible via isError/error even though local logout
  // proceeds regardless. Nothing currently reads this, but it's the
  // documented contract for whoever builds a "logged out, but you may
  // still be logged in on the server" notice later.
  it('still exposes the failure via isError/error, despite completing local logout', async () => {
    const mockError = new Error('Network Error');
    vi.mocked(api.post).mockRejectedValue(mockError);
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(mockError);
  });

  it('does not call the API just from being rendered', () => {
    const { Wrapper } = createQueryWrapper();
    renderHook(() => useLogout(), { wrapper: Wrapper });
    expect(api.post).not.toHaveBeenCalled();
  });
});

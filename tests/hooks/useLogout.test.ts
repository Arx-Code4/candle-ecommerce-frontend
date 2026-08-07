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

  // ADDED TEST — local logout must happen even if the component unmounts before
  // the API call settles (user navigates away, etc.). The mutation's onSettled
  // is decoupled from the component's lifecycle, so clearAuth + navigate still
  // fire.
  it('clears auth and navigates to login even if the component unmounts during the request', async () => {
    let resolvePost: (value: unknown) => void;
    const postPromise = new Promise((resolve) => {
      resolvePost = resolve;
    });
    vi.mocked(api.post).mockReturnValue(postPromise as ReturnType<typeof api.post>);

    const { Wrapper } = createQueryWrapper();
    const { result, unmount } = renderHook(() => useLogout(), { wrapper: Wrapper });

    result.current.mutate();

    unmount(); // remove the hook from React tree

    // Resolve the request after unmount
    resolvePost!({ data: null });

    await vi.waitFor(() => {
      expect(clearAuth).toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith(ROUTES.LOGIN);
    });
  });

  // ADDED TEST — if clearAuth itself throws (e.g. corrupted state), the mutation
  // should enter an error state and navigation must be skipped because the user
  // might still be marked as authenticated client‑side.
  it('skips navigation when clearAuth throws, and surfaces the error', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: null });
    // Override the store mock so clearAuth throws
    vi.mocked(useAuthStore).mockImplementation((selector) =>
      selector({
        clearAuth: vi.fn().mockImplementation(() => {
          throw new Error('clearAuth failed');
        }),
      } as unknown as ReturnType<typeof useAuthStore.getState>)
    );
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(navigate).not.toHaveBeenCalled();
    expect(result.current.error).toBeInstanceOf(Error);
  });

  // ADDED TEST — combination: API succeeds but clearAuth throws; navigation
  // still skipped (mirrors the decision above but exercises the success path of
  // the HTTP call).
  it('does not navigate when API call succeeds but clearAuth throws', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: null });
    vi.mocked(useAuthStore).mockImplementation((selector) =>
      selector({
        clearAuth: vi.fn().mockImplementation(() => {
          throw new Error('clearAuth failed');
        }),
      } as unknown as ReturnType<typeof useAuthStore.getState>)
    );
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(api.post).toHaveBeenCalledWith('/auth/logout'); // API did fire
    expect(navigate).not.toHaveBeenCalled();
  });
});

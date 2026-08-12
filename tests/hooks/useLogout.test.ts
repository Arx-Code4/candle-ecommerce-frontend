// tests/hooks/useLogout.test.ts
vi.mock('@/lib/axios');
vi.mock('@/store/auth.store');
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: vi.fn() };
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLogout } from '@/hooks/useLogout';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { createQueryWrapper } from '../test-utils';

describe('useLogout', () => {
  const clearAuth = vi.fn();
  const navigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // FIX: useAuthStore mock returns an object with clearAuth, not a selector function
    vi.mocked(useAuthStore).mockImplementation(() => ({
      clearAuth,
    }));
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

  it('still clears local auth state and navigates to /login even when the API call fails', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('Network Error'));
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(clearAuth).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(ROUTES.LOGIN);
  });

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

  it('clears auth and navigates to login even if the component unmounts during the request', async () => {
    let resolvePost: (value: unknown) => void;
    const postPromise = new Promise((resolve) => {
      resolvePost = resolve;
    });
    vi.mocked(api.post).mockReturnValue(postPromise as ReturnType<typeof api.post>);

    const { Wrapper } = createQueryWrapper();
    const { result, unmount } = renderHook(() => useLogout(), { wrapper: Wrapper });

    result.current.mutate();

    unmount();

    resolvePost!({ data: null });

    await vi.waitFor(() => {
      expect(clearAuth).toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith(ROUTES.LOGIN);
    });
  });

  it('skips navigation when clearAuth throws, and surfaces the error', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: null });
    vi.mocked(useAuthStore).mockImplementation(() => ({
      clearAuth: vi.fn().mockImplementation(() => {
        throw new Error('clearAuth failed');
      }),
    }));
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(navigate).not.toHaveBeenCalled();
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('does not navigate when API call succeeds but clearAuth throws', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: null });
    vi.mocked(useAuthStore).mockImplementation(() => ({
      clearAuth: vi.fn().mockImplementation(() => {
        throw new Error('clearAuth failed');
      }),
    }));
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(api.post).toHaveBeenCalledWith('/auth/logout');
    expect(navigate).not.toHaveBeenCalled();
  });
});

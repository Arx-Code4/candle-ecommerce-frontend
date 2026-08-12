// tests/hooks/useLogin.test.ts
vi.mock('@/lib/axios');
vi.mock('@/store/auth.store');
vi.mock('@/lib/redirect');
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: vi.fn(), useSearchParams: vi.fn() };
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLogin } from '@/hooks/useLogin';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { getSafeRedirectPath } from '@/lib/redirect';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES, QUERY_KEYS } from '@/constants';
import { createQueryWrapper } from '../test-utils';
import type { User } from '@/types';

const customerUser: User = {
  id: 'u1',
  email: 'jane@example.com',
  role: 'CUSTOMER',
  createdAt: '2026-01-01T00:00:00.000Z',
};
const adminUser: User = { ...customerUser, id: 'u2', role: 'ADMIN' };

describe('useLogin', () => {
  const setAuth = vi.fn();
  const navigate = vi.fn();
  let invalidateQueriesSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockImplementation(() => ({
      setAuth,
    }));
    vi.mocked(useNavigate).mockReturnValue(navigate);
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams(),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(getSafeRedirectPath).mockImplementation((raw, fallback) => raw ?? fallback);
  });

  function setup() {
    const { Wrapper, queryClient } = createQueryWrapper();
    const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });
    invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    return result;
  }

  it('calls POST /auth/login with form values', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { user: customerUser, accessToken: 'at-1', cartItemAdded: false },
    });
    const result = setup();

    result.current.mutate({ email: 'jane@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'jane@example.com',
      password: 'password123',
    });
  });

  it('on success, persists auth state before navigating', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { user: customerUser, accessToken: 'at-1', cartItemAdded: false },
    });
    const result = setup();

    result.current.mutate({ email: 'jane@example.com', password: 'password123' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setAuth).toHaveBeenCalledWith('at-1', customerUser);
    const setAuthOrder = setAuth.mock.invocationCallOrder[0];
    const navigateOrder = navigate.mock.invocationCallOrder[0];
    expect(setAuthOrder).toBeLessThan(navigateOrder);
  });

  it('invalidates the cart query when cartItemAdded is true', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { user: customerUser, accessToken: 'at-1', cartItemAdded: true },
    });
    const result = setup();

    result.current.mutate({ email: 'jane@example.com', password: 'password123' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: [QUERY_KEYS.CART] });
  });

  it('treats a missing cartItemAdded field the same as false', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { user: customerUser, accessToken: 'at-1' } });
    const result = setup();

    result.current.mutate({ email: 'jane@example.com', password: 'password123' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });

  it('admin role always navigates to /admin/products, ignoring any redirect param', async () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams('redirect=/checkout'),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(api.post).mockResolvedValue({
      data: { user: adminUser, accessToken: 'at-1', cartItemAdded: false },
    });
    const result = setup();

    result.current.mutate({ email: 'admin@example.com', password: 'password123' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(navigate).toHaveBeenCalledWith(ROUTES.ADMIN_PRODUCTS);
    expect(getSafeRedirectPath).not.toHaveBeenCalled();
  });

  it('non-admin role honors a valid redirect param via getSafeRedirectPath', async () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams('redirect=/checkout'),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(api.post).mockResolvedValue({
      data: { user: customerUser, accessToken: 'at-1', cartItemAdded: false },
    });
    const result = setup();

    result.current.mutate({ email: 'jane@example.com', password: 'password123' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getSafeRedirectPath).toHaveBeenCalledWith('/checkout', ROUTES.HOME);
    expect(navigate).toHaveBeenCalledWith('/checkout');
  });

  it('non-admin role falls back to / when redirect is absent', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { user: customerUser, accessToken: 'at-1', cartItemAdded: false },
    });
    const result = setup();

    result.current.mutate({ email: 'jane@example.com', password: 'password123' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getSafeRedirectPath).toHaveBeenCalledWith(null, ROUTES.HOME);
  });

  it('non-admin role navigates to whatever getSafeRedirectPath returns for an open-redirect attempt', async () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams('redirect=https://evil.example.com'),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(getSafeRedirectPath).mockReturnValue(ROUTES.HOME);
    vi.mocked(api.post).mockResolvedValue({
      data: { user: customerUser, accessToken: 'at-1', cartItemAdded: false },
    });
    const result = setup();

    result.current.mutate({ email: 'jane@example.com', password: 'password123' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(navigate).toHaveBeenCalledWith(ROUTES.HOME);
  });

  it('reads pendingVariantId from URL search params at call time', async () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams('pendingVariantId=variant-1'),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(api.post).mockResolvedValue({
      data: { user: customerUser, accessToken: 'at-1', cartItemAdded: false },
    });
    const result = setup();

    result.current.mutate({ email: 'jane@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'jane@example.com',
      password: 'password123',
      pendingVariantId: 'variant-1',
    });
  });

  it('propagates an invalid-credentials (401) failure without side effects', async () => {
    const mockError = { isAxiosError: true, response: { status: 401 } };
    vi.mocked(api.post).mockRejectedValue(mockError);
    const result = setup();

    result.current.mutate({ email: 'jane@example.com', password: 'wrong' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(setAuth).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not call setAuth or navigate when response lacks accessToken', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { user: customerUser }, // no accessToken
    });
    const result = setup();

    result.current.mutate({ email: 'jane@example.com', password: 'password123' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(setAuth).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('propagates a server error (500) failure without side effects', async () => {
    const mockError = { isAxiosError: true, response: { status: 500 } };
    vi.mocked(api.post).mockRejectedValue(mockError);
    const result = setup();

    result.current.mutate({ email: 'jane@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(setAuth).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('transitions to error state when setAuth throws', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { user: customerUser, accessToken: 'at-1', cartItemAdded: false },
    });
    vi.mocked(useAuthStore).mockImplementation(() => ({
      setAuth: vi.fn().mockImplementation(() => {
        throw new Error('setAuth failed');
      }),
    }));
    const result = setup();

    result.current.mutate({ email: 'jane@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not call setAuth or navigate if the component unmounts before the response', async () => {
    let resolvePost: (value: unknown) => void;
    const postPromise = new Promise((resolve) => {
      resolvePost = resolve;
    });
    vi.mocked(api.post).mockReturnValue(postPromise as ReturnType<typeof api.post>);

    const { Wrapper, queryClient } = createQueryWrapper();
    const { result, unmount } = renderHook(() => useLogin(), { wrapper: Wrapper });
    vi.spyOn(queryClient, 'invalidateQueries');

    result.current.mutate({ email: 'jane@example.com', password: 'password123' });

    unmount();

    resolvePost!({ data: { user: customerUser, accessToken: 'at-1', cartItemAdded: false } });

    await vi.waitFor(() => {
      expect(setAuth).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  it('handles concurrent mutations by discarding stale responses', async () => {
    let resolvePost1: (value: unknown) => void;
    let resolvePost2: (value: unknown) => void;
    const postPromise1 = new Promise((resolve) => {
      resolvePost1 = resolve;
    });
    const postPromise2 = new Promise((resolve) => {
      resolvePost2 = resolve;
    });

    vi.mocked(api.post)
      .mockReturnValueOnce(postPromise1 as ReturnType<typeof api.post>)
      .mockReturnValueOnce(postPromise2 as ReturnType<typeof api.post>);

    const result = setup();

    result.current.mutate({ email: 'old@example.com', password: 'oldpass' });
    result.current.mutate({ email: 'latest@example.com', password: 'latestpass' });

    const latestUser: User = { ...customerUser, id: 'u-latest', email: 'latest@example.com' };
    resolvePost2!({ data: { user: latestUser, accessToken: 'token-latest', cartItemAdded: true } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setAuth).toHaveBeenCalledTimes(1);
    expect(setAuth).toHaveBeenCalledWith('token-latest', latestUser);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: [QUERY_KEYS.CART] });

    const staleUser: User = { ...customerUser, id: 'u-stale', email: 'old@example.com' };
    resolvePost1!({ data: { user: staleUser, accessToken: 'token-stale', cartItemAdded: false } });

    await vi.waitFor(() => {
      expect(setAuth).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledTimes(1);
    });
  });

  it('navigates to home silently when getSafeRedirectPath throws', async () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams('redirect=/checkout'),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(getSafeRedirectPath).mockImplementation(() => {
      throw new Error('Invalid redirect');
    });
    vi.mocked(api.post).mockResolvedValue({
      data: { user: customerUser, accessToken: 'at-1', cartItemAdded: false },
    });
    const result = setup();

    result.current.mutate({ email: 'jane@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(navigate).toHaveBeenCalledWith(ROUTES.HOME);
  });
});

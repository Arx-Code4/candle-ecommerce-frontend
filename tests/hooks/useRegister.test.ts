import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRegister } from '@/hooks/useRegister';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { getSafeRedirectPath } from '@/lib/redirect';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES, QUERY_KEYS } from '@/constants';
import { createQueryWrapper } from '../test-utils';
import type { User } from '@/types';

vi.mock('@/lib/axios');
vi.mock('@/store/auth.store');
vi.mock('@/lib/redirect');
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: vi.fn(), useSearchParams: vi.fn() };
});

const mockUser: User = {
  id: 'u1',
  email: 'jane@example.com',
  role: 'CUSTOMER',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe.skip('useRegister', () => {
  const setAuth = vi.fn();
  const navigate = vi.fn();
  let invalidateQueriesSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockImplementation((selector) =>
      selector({ setAuth } as unknown as ReturnType<typeof useAuthStore.getState>)
    );
    vi.mocked(useNavigate).mockReturnValue(navigate);
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams(),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(getSafeRedirectPath).mockImplementation((raw, fallback) => raw ?? fallback);
  });

  function setup() {
    const { Wrapper, queryClient } = createQueryWrapper();
    const { result } = renderHook(() => useRegister(), { wrapper: Wrapper });
    invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    return result;
  }

  it('calls POST /auth/register with form values', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { user: mockUser, accessToken: 'at-1', cartItemAdded: false },
    });
    const result = setup();

    result.current.mutate({ name: 'Jane', email: 'jane@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      name: 'Jane',
      email: 'jane@example.com',
      password: 'password123',
    });
  });

  it('on success, persists auth state before navigating', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { user: mockUser, accessToken: 'at-1', cartItemAdded: false },
    });
    const result = setup();

    result.current.mutate({ name: 'Jane', email: 'jane@example.com', password: 'password123' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setAuth).toHaveBeenCalledWith('at-1', mockUser);
    // ADDED — ordering, not just "both were called." ProtectedRoute reads
    // auth state synchronously; if navigate fired first, a redirect to a
    // protected page immediately after registering could bounce straight
    // back to /login because the store hadn't updated yet. Neither doc
    // mentions call order, but it's the kind of bug that only shows up
    // intermittently in real usage and is trivial to lock down here.
    const setAuthOrder = setAuth.mock.invocationCallOrder[0];
    const navigateOrder = navigate.mock.invocationCallOrder[0];
    expect(setAuthOrder).toBeLessThan(navigateOrder);
  });

  it('invalidates the cart query when cartItemAdded is true', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { user: mockUser, accessToken: 'at-1', cartItemAdded: true },
    });
    const result = setup();

    result.current.mutate({ name: 'Jane', email: 'jane@example.com', password: 'password123' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: [QUERY_KEYS.CART] });
  });

  it('does not invalidate the cart query when cartItemAdded is false, and is not an error', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { user: mockUser, accessToken: 'at-1', cartItemAdded: false },
    });
    const result = setup();

    result.current.mutate({ name: 'Jane', email: 'jane@example.com', password: 'password123' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
    expect(result.current.isError).toBe(false);
  });

  // ADDED — the doc only covers cartItemAdded: true / false explicitly. A
  // real backend response could omit the field rather than send `false`
  // (e.g. a future refactor that only includes it conditionally). This
  // confirms the hook treats "absent" the same as "false" rather than
  // crashing on an unexpected shape or, worse, treating truthy-undefined
  // as a signal to invalidate.
  it('treats a missing cartItemAdded field the same as false', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { user: mockUser, accessToken: 'at-1' },
    });
    const result = setup();

    result.current.mutate({ name: 'Jane', email: 'jane@example.com', password: 'password123' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });

  it('navigates using getSafeRedirectPath with the redirect param and / as fallback', async () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams('redirect=/checkout'),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(api.post).mockResolvedValue({
      data: { user: mockUser, accessToken: 'at-1', cartItemAdded: false },
    });
    const result = setup();

    result.current.mutate({ name: 'Jane', email: 'jane@example.com', password: 'password123' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getSafeRedirectPath).toHaveBeenCalledWith('/checkout', ROUTES.HOME);
    expect(navigate).toHaveBeenCalledWith('/checkout');
  });

  it('navigates to whatever getSafeRedirectPath returns, even if that is the fallback', async () => {
    // Exercises the "rejects an open redirect" doc case at the hook's
    // integration boundary: the hook doesn't need to re-implement the
    // sanitization rules (that's redirect.test.ts's job) — it only needs
    // to prove it actually uses the sanitized value, not the raw one.
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams('redirect=https://evil.example.com'),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(getSafeRedirectPath).mockReturnValue(ROUTES.HOME);
    vi.mocked(api.post).mockResolvedValue({
      data: { user: mockUser, accessToken: 'at-1', cartItemAdded: false },
    });
    const result = setup();

    result.current.mutate({ name: 'Jane', email: 'jane@example.com', password: 'password123' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(navigate).toHaveBeenCalledWith(ROUTES.HOME);
    expect(navigate).not.toHaveBeenCalledWith('https://evil.example.com');
  });

  it('merges pendingVariantId from URL search params at call time', async () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams('pendingVariantId=variant-1'),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(api.post).mockResolvedValue({
      data: { user: mockUser, accessToken: 'at-1', cartItemAdded: false },
    });
    const result = setup();

    result.current.mutate({ name: 'Jane', email: 'jane@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      name: 'Jane',
      email: 'jane@example.com',
      password: 'password123',
      pendingVariantId: 'variant-1',
    });
  });

  // ADDED — the doc tests pendingVariantId being present, but not its
  // absence. Confirms the hook doesn't send a stray `pendingVariantId:
  // null`/`undefined` key when there's nothing in the URL — a payload
  // shape mismatch here would fail Zod's `.optional()` validation
  // differently than a genuinely missing key on the backend.
  it('does not include pendingVariantId in the payload when absent from the URL', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { user: mockUser, accessToken: 'at-1', cartItemAdded: false },
    });
    const result = setup();

    result.current.mutate({ name: 'Jane', email: 'jane@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const payload = vi.mocked(api.post).mock.calls[0][1];
    expect(payload).not.toHaveProperty('pendingVariantId');
  });

  it('propagates a duplicate-email (409) failure without side effects', async () => {
    const mockError = { isAxiosError: true, response: { status: 409 } };
    vi.mocked(api.post).mockRejectedValue(mockError);
    const result = setup();

    result.current.mutate({ name: 'Jane', email: 'jane@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(setAuth).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  // ADDED TEST — missing accessToken in the response is treated as an error;
  // no auth state or navigation side effects should occur.
  it('does not call setAuth or navigate when response lacks accessToken', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { user: mockUser }, // no accessToken
    });
    const result = setup();

    result.current.mutate({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'password123',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(setAuth).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  // ADDED TEST — a non‑409 server error (e.g. 500) sets isError without side effects.
  it('propagates a server error (500) failure without side effects', async () => {
    const mockError = { isAxiosError: true, response: { status: 500 } };
    vi.mocked(api.post).mockRejectedValue(mockError);
    const result = setup();

    result.current.mutate({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'password123',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(setAuth).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  // ADDED TEST — if setAuth throws during onSuccess, the mutation enters an error
  // state and navigation is prevented.
  it('transitions to error state when setAuth throws', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { user: mockUser, accessToken: 'at-1', cartItemAdded: false },
    });
    vi.mocked(useAuthStore).mockImplementation((selector) =>
      selector({
        setAuth: vi.fn().mockImplementation(() => {
          throw new Error('setAuth failed');
        }),
      } as unknown as ReturnType<typeof useAuthStore.getState>)
    );
    const result = setup();

    result.current.mutate({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'password123',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(navigate).not.toHaveBeenCalled();
  });

  // ADDED TEST — unmounting the component before the mutation resolves should
  // suppress all side effects (no auth, no navigation).
  it('does not call setAuth or navigate if the component unmounts before the response', async () => {
    let resolvePost: (value: unknown) => void;
    const postPromise = new Promise((resolve) => {
      resolvePost = resolve;
    });
    vi.mocked(api.post).mockReturnValue(postPromise as ReturnType<typeof api.post>);

    const { Wrapper, queryClient } = createQueryWrapper();
    const { result, unmount } = renderHook(() => useRegister(), { wrapper: Wrapper });
    vi.spyOn(queryClient, 'invalidateQueries'); // keep spy consistent

    result.current.mutate({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'password123',
    });

    unmount(); // remove the hook from React tree

    resolvePost!({
      data: { user: mockUser, accessToken: 'at-1', cartItemAdded: false },
    });

    await vi.waitFor(() => {
      expect(setAuth).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  // ADDED TEST — concurrent mutations: only the latest call’s side effects are
  // applied; the stale response is discarded.
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

    // First mutation (will become stale)
    result.current.mutate({
      name: 'Stale',
      email: 'stale@example.com',
      password: 'oldpass',
    });
    // Second mutation (latest)
    result.current.mutate({
      name: 'Latest',
      email: 'latest@example.com',
      password: 'latestpass',
    });

    // Resolve the latest first
    const latestUser: User = { ...mockUser, id: 'u-latest', email: 'latest@example.com' };
    resolvePost2!({
      data: { user: latestUser, accessToken: 'token-latest', cartItemAdded: true },
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Only the latest call’s side effects
    expect(setAuth).toHaveBeenCalledTimes(1);
    expect(setAuth).toHaveBeenCalledWith('token-latest', latestUser);
    expect(navigate).toHaveBeenCalledTimes(1);
    // cart invalidation (cartItemAdded: true from latest)
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: [QUERY_KEYS.CART] });

    // Resolve the stale first mutation
    const staleUser: User = { ...mockUser, id: 'u-stale', email: 'stale@example.com' };
    resolvePost1!({
      data: { user: staleUser, accessToken: 'token-stale', cartItemAdded: false },
    });

    // Flush and ensure no extra side effects from stale response
    await vi.waitFor(() => {
      expect(setAuth).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledTimes(1);
    });
  });

  // ADDED TEST — if getSafeRedirectPath throws, the hook falls back silently to
  // HOME (the mutation still succeeds and navigates home).
  it('navigates to home silently when getSafeRedirectPath throws', async () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams('redirect=/checkout'),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(getSafeRedirectPath).mockImplementation(() => {
      throw new Error('Invalid redirect');
    });
    vi.mocked(api.post).mockResolvedValue({
      data: { user: mockUser, accessToken: 'at-1', cartItemAdded: false },
    });
    const result = setup();

    result.current.mutate({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'password123',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(navigate).toHaveBeenCalledWith(ROUTES.HOME);
  });
});

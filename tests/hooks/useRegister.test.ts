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
});

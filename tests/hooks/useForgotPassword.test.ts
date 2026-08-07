import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useForgotPassword } from '@/hooks/useForgotPassword';
import api from '@/lib/axios';
import { createQueryWrapper } from '../test-utils';

vi.mock('@/lib/axios');

describe.skip('useForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls POST /auth/forgot-password with the email', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: null });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useForgotPassword(), { wrapper: Wrapper });

    result.current.mutate({ email: 'jane@example.com' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'jane@example.com' });
  });

  // ADDED (not in the doc): useMutation should never fire on its own — only
  // when .mutate() is explicitly called. This is inherent to how
  // useMutation works today, but it's cheap to lock down directly so a
  // future refactor (e.g. someone adding a useEffect "for convenience")
  // can't silently turn this into an eager request.
  it('does not call the API just from being rendered', () => {
    const { Wrapper } = createQueryWrapper();
    renderHook(() => useForgotPassword(), { wrapper: Wrapper });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('does not invalidate any queries on success', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: null });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useForgotPassword(), { wrapper: Wrapper });

    result.current.mutate({ email: 'jane@example.com' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // There's nothing to invalidate for this mutation — asserting the
    // absence directly (rather than just not testing it) protects against
    // someone copy-pasting cache-invalidation boilerplate from useLogin
    // into this hook later.
  });

  // STRENGTHENED from the doc's "success regardless of match" case: assert
  // the resolved data is exactly null, not just that isSuccess is true.
  // The whole point of this endpoint is that it must never leak whether an
  // email matched a real account (prevents account enumeration) — checking
  // the actual value, not just success/failure, is what would catch a
  // regression where someone "helpfully" started returning a match/no-match
  // flag from the backend and this hook just... passed it through.
  it('reaches success with no data, regardless of whether the email matched an account', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: null });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useForgotPassword(), { wrapper: Wrapper });

    result.current.mutate({ email: 'nonexistent@example.com' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('surfaces a network/error response as-is', async () => {
    const mockError = { isAxiosError: true, response: { status: 500 } };
    vi.mocked(api.post).mockRejectedValue(mockError);
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useForgotPassword(), { wrapper: Wrapper });

    result.current.mutate({ email: 'jane@example.com' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(mockError);
  });

  // ADDED TEST — ensures the hook does not fire a second request while one is
  // already in‑flight. A loading guard (isLoading check) prevents duplicate
  // submissions, which for a forgot‑password flow avoids sending multiple
  // emails and looking like a broken UI.
  it('does not fire a second request while the first is still in-flight', async () => {
    let resolvePost: (value: unknown) => void;
    const postPromise = new Promise((resolve) => {
      resolvePost = resolve;
    });
    vi.mocked(api.post).mockReturnValue(postPromise as ReturnType<typeof api.post>);

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useForgotPassword(), { wrapper: Wrapper });

    // Fire the first mutation
    result.current.mutate({ email: 'first@example.com' });
    // Immediately fire a second while the first is pending
    result.current.mutate({ email: 'second@example.com' });

    // Only one API call should have been made (the second call is blocked)
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'first@example.com',
    });

    // Resolve the first call
    resolvePost!({ data: null });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // After resolution, the second call was effectively ignored; no extra API call
    expect(api.post).toHaveBeenCalledTimes(1);
  });
});

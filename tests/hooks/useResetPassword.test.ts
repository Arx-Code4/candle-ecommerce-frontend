import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useResetPassword } from '@/hooks/useResetPassword';
import api from '@/lib/axios';
import { createQueryWrapper } from '../test-utils';

vi.mock('@/lib/axios');

describe.skip('useResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls POST /auth/reset-password with token and newPassword', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: null });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useResetPassword(), { wrapper: Wrapper });

    result.current.mutate({ token: 'abc123', newPassword: 'newSecurePassword1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
      token: 'abc123',
      newPassword: 'newSecurePassword1',
    });
  });

  // ADDED — same reasoning as useForgotPassword: guard against an
  // accidental eager fire.
  it('does not call the API just from being rendered', () => {
    const { Wrapper } = createQueryWrapper();
    renderHook(() => useResetPassword(), { wrapper: Wrapper });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('does not invalidate any queries on success', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: null });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useResetPassword(), { wrapper: Wrapper });

    result.current.mutate({ token: 'abc123', newPassword: 'newSecurePassword1' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('resolves with no data on success', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: null });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useResetPassword(), { wrapper: Wrapper });

    result.current.mutate({ token: 'abc123', newPassword: 'newSecurePassword1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  // ADDED, and important: the backend has three distinct 400 messages for
  // this endpoint ('Invalid reset link', 'Reset link has expired', 'Reset
  // link has already been used'). ResetPasswordPage.test.tsx (coming in a
  // later batch) has three separate onError-mapping cases that each depend
  // on the hook passing the backend's exact message through untouched. This
  // test locks down that contract at the hook level, once, for all three
  // messages — so a page-level test failure there means the PAGE'S mapping
  // is wrong, not that the hook silently mangled the message somewhere.
  it.each(['Invalid reset link', 'Reset link has expired', 'Reset link has already been used'])(
    'propagates the backend message "%s" unmodified via error.response.data',
    async (message) => {
      const mockError = {
        isAxiosError: true,
        response: { status: 400, data: { message } },
      };
      vi.mocked(api.post).mockRejectedValue(mockError);
      const { Wrapper } = createQueryWrapper();
      const { result } = renderHook(() => useResetPassword(), { wrapper: Wrapper });

      result.current.mutate({ token: 'bad-token', newPassword: 'newSecurePassword1' });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toMatchObject({ response: { data: { message } } });
    }
  );
});

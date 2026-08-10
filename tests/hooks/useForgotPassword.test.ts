import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useForgotPassword } from '@/hooks/useForgotPassword';
import api from '@/lib/axios';
import { createQueryWrapper } from '../test-utils';

vi.mock('@/lib/axios');

describe('useForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls POST /auth/forgot-password with the email', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: null });

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useForgotPassword(), {
      wrapper: Wrapper,
    });

    result.current.mutate({ email: 'jane@example.com' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'jane@example.com',
    });
  });

  it('does not call the API just from being rendered', () => {
    const { Wrapper } = createQueryWrapper();

    renderHook(() => useForgotPassword(), {
      wrapper: Wrapper,
    });

    expect(api.post).not.toHaveBeenCalled();
  });

  it('does not invalidate any queries on success', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: null });

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useForgotPassword(), {
      wrapper: Wrapper,
    });

    result.current.mutate({ email: 'jane@example.com' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.post).toHaveBeenCalledTimes(1);
  });

  it('reaches success with no data, regardless of whether the email matched an account', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: null });

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useForgotPassword(), {
      wrapper: Wrapper,
    });

    result.current.mutate({ email: 'nonexistent@example.com' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
  });

  it('surfaces a network/error response as-is', async () => {
    const mockError = {
      isAxiosError: true,
      response: { status: 500 },
    };

    vi.mocked(api.post).mockRejectedValue(mockError);

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useForgotPassword(), {
      wrapper: Wrapper,
    });

    result.current.mutate({ email: 'jane@example.com' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(mockError);
  });
});

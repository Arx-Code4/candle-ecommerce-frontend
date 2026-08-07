import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCart } from '@/hooks/useCart';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { QUERY_KEYS } from '@/constants';
import { createQueryWrapper } from '../test-utils';
import type { Cart } from '@/types';

vi.mock('@/lib/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('@/store/auth.store');

const mockCart: Cart = { items: [], total: '0.00' };

describe.skip('useCart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockAuth(accessToken: string | null) {
    vi.mocked(useAuthStore).mockImplementation((selector) =>
      selector({ accessToken } as unknown as ReturnType<typeof useAuthStore.getState>)
    );
  }

  it('fetches the cart when authenticated', async () => {
    mockAuth('abc');
    vi.mocked(api.get).mockResolvedValue({ data: mockCart });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/cart');
    expect(result.current.data).toEqual(mockCart);
  });

  it('does not fire when unauthenticated', async () => {
    mockAuth(null);
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });

    // enabled: !!accessToken — must never hit the network for anonymous visitors
    expect(api.get).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
    expect(result.current.isError).toBe(false);
  });

  it('query key has no params', async () => {
    mockAuth('abc');
    vi.mocked(api.get).mockResolvedValue({ data: mockCart });
    const { Wrapper, queryClient } = createQueryWrapper();
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData([QUERY_KEYS.CART])).toBeDefined();
  });
});


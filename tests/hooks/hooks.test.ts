// eco-9.2.2 Shop (Catalog & Cart) — hook tests (combined, skipped)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import { useProducts } from '@/hooks/useProducts';
import { useProduct } from '@/hooks/useProduct';
import { useCart } from '@/hooks/useCart';
import { useAddCartItem } from '@/hooks/useAddCartItem';
import { useUpdateCartItem } from '@/hooks/useUpdateCartItem';
import { useRemoveCartItem } from '@/hooks/useRemoveCartItem';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { QUERY_KEYS } from '@/constants';
import { createQueryWrapper } from '../test-utils';
import type { Cart, CartMutationResult, PaginatedResult, Product } from '@/types';

vi.mock('@/lib/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('@/store/auth.store');

const mockPage: PaginatedResult<Product> = {
  items: [],
  page: 2,
  limit: 20,
  total: 0,
};

describe.skip('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches with the given filters', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPage });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(
      () => useProducts({ scent: 'vanilla', page: 2, limit: 20 }),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/products', {
      params: { scent: 'vanilla', page: 2, limit: 20 },
    });
  });

  it('query key includes the filters object', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPage });
    const { Wrapper, queryClient } = createQueryWrapper();

    const { result, rerender } = renderHook(
      (filters: { scent?: string }) => useProducts(filters),
      { wrapper: Wrapper, initialProps: { scent: 'vanilla' } }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData([QUERY_KEYS.PRODUCTS, { scent: 'vanilla' }])).toBeDefined();

    rerender({ scent: 'lavender' });
    await waitFor(() => {
      expect(queryClient.getQueryData([QUERY_KEYS.PRODUCTS, { scent: 'lavender' }])).toBeDefined();
    });
    expect(queryClient.getQueryData([QUERY_KEYS.PRODUCTS, { scent: 'vanilla' }])).toBeDefined();
  });

  it('no filters passed still resolves', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPage });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useProducts(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/products', { params: undefined });
  });

  it('surfaces an error state on failure', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('network'));
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useProducts(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

const mockProduct: Product = {
  id: 'p1',
  name: 'Vanilla Candle',
  description: 'Warm vanilla',
  price: 25,
  isPublished: true,
  photos: [],
  variants: [],
};

describe.skip('useProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches by id', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockProduct });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useProduct('p1'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/products/p1');
  });

  it('query key is scoped by id', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockProduct });
    const { Wrapper, queryClient } = createQueryWrapper();

    const { result, rerender } = renderHook((id: string) => useProduct(id), {
      wrapper: Wrapper,
      initialProps: 'p1',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData([QUERY_KEYS.PRODUCTS, 'p1'])).toBeDefined();

    rerender('p2');
    await waitFor(() => {
      expect(queryClient.getQueryData([QUERY_KEYS.PRODUCTS, 'p2'])).toBeDefined();
    });
    expect(queryClient.getQueryData([QUERY_KEYS.PRODUCTS, 'p1'])).toBeDefined();
  });

  it('404 surfaces as an error state', async () => {
    const error = new AxiosError('Not Found');
    error.response = { status: 404, data: {}, statusText: 'Not Found', headers: {}, config: {} as never };
    vi.mocked(api.get).mockRejectedValue(error);

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useProduct('missing'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
    expect((result.current.error as AxiosError).response?.status).toBe(404);
  });
});

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

const productVariantId = 'variant-1';

describe.skip('useAddCartItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls POST /cart/items', async () => {
    const response: CartMutationResult = {
      cartTotal: '50.00',
      wasCapped: false,
    };
    vi.mocked(api.post).mockResolvedValue({ data: response });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAddCartItem(), { wrapper: Wrapper });

    result.current.mutate({ productVariantId, quantity: 2 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.post).toHaveBeenCalledWith('/cart/items', {
      productVariantId,
      quantity: 2,
    });
  });

  it('invalidates CART on success', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { cartTotal: '50.00', wasCapped: false },
    });
    const { Wrapper, queryClient } = createQueryWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAddCartItem(), { wrapper: Wrapper });

    result.current.mutate({ productVariantId, quantity: 1 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [QUERY_KEYS.CART] });
  });

  it('hook does not hardcode toast copy', async () => {
    const response: CartMutationResult = {
      cartTotal: '50.00',
      wasCapped: true,
      cappedTo: 3,
      message: 'Only 3 left — quantity adjusted',
    };
    vi.mocked(api.post).mockResolvedValue({ data: response });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAddCartItem(), { wrapper: Wrapper });

    result.current.mutate({ productVariantId, quantity: 10 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(response);
  });

  it('409 out-of-stock race surfaces via normal error state', async () => {
    const error = new AxiosError('Conflict');
    error.response = {
      status: 409,
      data: {},
      statusText: 'Conflict',
      headers: {},
      config: {} as never,
    };
    vi.mocked(api.post).mockRejectedValue(error);
    const { Wrapper, queryClient } = createQueryWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAddCartItem(), { wrapper: Wrapper });

    result.current.mutate({ productVariantId, quantity: 1 });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

const itemId = 'item-1';

describe.skip('useUpdateCartItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls PATCH /cart/items/:itemId', async () => {
    vi.mocked(api.patch).mockResolvedValue({
      data: { cartTotal: '75.00', wasCapped: false },
    });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUpdateCartItem(), { wrapper: Wrapper });

    result.current.mutate({ itemId, quantity: 3 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.patch).toHaveBeenCalledWith(`/cart/items/${itemId}`, { quantity: 3 });
  });

  it('invalidates CART on success', async () => {
    vi.mocked(api.patch).mockResolvedValue({
      data: { cartTotal: '75.00', wasCapped: false },
    });
    const { Wrapper, queryClient } = createQueryWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useUpdateCartItem(), { wrapper: Wrapper });

    result.current.mutate({ itemId, quantity: 3 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [QUERY_KEYS.CART] });
  });

  it('exposes the same wasCapped/cappedTo shape as useAddCartItem', async () => {
    const response: CartMutationResult = {
      cartTotal: '50.00',
      wasCapped: true,
      cappedTo: 5,
    };
    vi.mocked(api.patch).mockResolvedValue({ data: response });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUpdateCartItem(), { wrapper: Wrapper });

    result.current.mutate({ itemId, quantity: 10 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.wasCapped).toBe(true);
    expect(result.current.data?.cappedTo).toBe(5);
  });
});


describe.skip('useRemoveCartItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls DELETE /cart/items/:itemId', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { cartTotal: '0.00' } });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useRemoveCartItem(), { wrapper: Wrapper });

    result.current.mutate({ itemId });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.delete).toHaveBeenCalledWith(`/cart/items/${itemId}`);
  });

  it('invalidates CART on success', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { cartTotal: '0.00' } });
    const { Wrapper, queryClient } = createQueryWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRemoveCartItem(), { wrapper: Wrapper });

    result.current.mutate({ itemId });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [QUERY_KEYS.CART] });
  });

  it('error state on failure', async () => {
    vi.mocked(api.delete).mockRejectedValue(new Error('network'));
    const { Wrapper, queryClient } = createQueryWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRemoveCartItem(), { wrapper: Wrapper });

    result.current.mutate({ itemId });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});


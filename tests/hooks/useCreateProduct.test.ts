import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCreateProduct } from '@/hooks/useCreateProduct';
import { postForm } from '@/lib/axios';
import { buildProductFormData } from '@/lib/productFormData';
import { QUERY_KEYS } from '@/constants';
import { createQueryWrapper } from '../test-utils';
import { mockAxiosResponse } from '../mockAxiosResponse';
import type { Product, ProductFormInput } from '@/types';

vi.mock('@/lib/axios');
vi.mock('@/lib/productFormData');

const mockProduct: Product = {
  id: 'p1',
  name: 'Candle',
  description: 'Nice',
  price: 25,
  isPublished: false,
  primaryPhotoUrl: 'jjj',
  photos: [],
  variants: [],
};

const validInput: ProductFormInput = {
  name: 'Candle',
  description: 'Nice',
  price: 25,
  variants: [{ scent: 'Vanilla', size: 'Large', stock: 10 }],
  photos: [],
};

describe.skip('useCreateProduct', () => {
  let invalidateQueriesSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setup() {
    const { Wrapper, queryClient } = createQueryWrapper();
    const { result } = renderHook(() => useCreateProduct(), { wrapper: Wrapper });
    invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    return result;
  }

  it('builds FormData via buildProductFormData and posts it as multipart', async () => {
    const fakeFormData = new FormData();
    vi.mocked(buildProductFormData).mockReturnValue(fakeFormData);
    vi.mocked(postForm).mockResolvedValue(mockAxiosResponse(mockProduct));
    const result = setup();

    result.current.mutate(validInput);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(buildProductFormData).toHaveBeenCalledWith(validInput);
    expect(postForm).toHaveBeenCalledWith('/admin/products', fakeFormData);
  });

  it('invalidates the admin products list on success', async () => {
    vi.mocked(buildProductFormData).mockReturnValue(new FormData());
    vi.mocked(postForm).mockResolvedValue(mockAxiosResponse(mockProduct));
    const result = setup();

    result.current.mutate(validInput);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: [QUERY_KEYS.ADMIN_PRODUCTS] });
  });

  it('does not call the API just from being rendered', () => {
    const { Wrapper } = createQueryWrapper();
    renderHook(() => useCreateProduct(), { wrapper: Wrapper });
    expect(postForm).not.toHaveBeenCalled();
  });

  it('propagates a validation failure (400) without invalidating anything', async () => {
    vi.mocked(buildProductFormData).mockReturnValue(new FormData());
    const mockError = {
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: 'Validation failed', errors: ['body.price: Required'] },
      },
    };
    vi.mocked(postForm).mockRejectedValue(mockError);
    const result = setup();

    result.current.mutate(validInput);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
    expect(result.current.error).toBe(mockError);
  });
  // Distinct from the 400/404 cases above — a genuine network failure
  // (offline, CORS, timeout) has no `.response` at all. If anything
  // downstream assumes `error.response.status` always exists, this is
  // the shape that would throw a second, unrelated error instead of
  // surfacing the real one.
  it('propagates a network failure (no response) without invalidating anything', async () => {
    vi.mocked(buildProductFormData).mockReturnValue(new FormData());
    const networkError = { isAxiosError: true, message: 'Network Error' };
    vi.mocked(postForm).mockRejectedValue(networkError); // or patchForm for useUpdateProduct
    const result = setup();

    result.current.mutate(validInput);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
    expect(result.current.error).toBe(networkError);
  });
  it('exposes the created product on the mutation result', async () => {
    vi.mocked(buildProductFormData).mockReturnValue(new FormData());
    vi.mocked(postForm).mockResolvedValue(mockAxiosResponse(mockProduct));
    const result = setup();

    result.current.mutate(validInput);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockProduct);
  });
});

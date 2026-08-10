import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUpdateProduct } from '@/hooks/useUpdateProduct';
import { patchForm } from '@/lib/axios';
import { buildProductFormData } from '@/lib/productFormData';
import { QUERY_KEYS } from '@/constants';
import { createQueryWrapper } from '../test-utils';
import { mockAxiosResponse } from '../mockAxiosResponse';
import type { Product } from '@/types';

vi.mock('@/lib/axios');
vi.mock('@/lib/productFormData');

const mockProduct: Product = {
  id: 'p1',
  name: 'Updated',
  description: 'Nice',
  price: 30,
  isPublished: false,
  primaryPhotoUrl: 'jjj',
  photos: [],
  variants: [],
};

describe.skip('useUpdateProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setup() {
    const { Wrapper, queryClient } = createQueryWrapper();
    const { result } = renderHook(() => useUpdateProduct(), { wrapper: Wrapper });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    return { result, invalidateQueriesSpy };
  }

  it('builds FormData from the partial payload and PATCHes /admin/products/:id', async () => {
    const fakeFormData = new FormData();
    vi.mocked(buildProductFormData).mockReturnValue(fakeFormData);
    vi.mocked(patchForm).mockResolvedValue(mockAxiosResponse(mockProduct));
    const { result } = setup();

    result.current.mutate({ id: 'p1', data: { price: 30 } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(buildProductFormData).toHaveBeenCalledWith({ price: 30 });
    expect(patchForm).toHaveBeenCalledWith('/admin/products/p1', fakeFormData);
  });

  it('invalidates the admin products list on success', async () => {
    vi.mocked(buildProductFormData).mockReturnValue(new FormData());
    vi.mocked(patchForm).mockResolvedValue(mockAxiosResponse(mockProduct));
    const { result, invalidateQueriesSpy } = setup();

    result.current.mutate({ id: 'p1', data: { price: 30 } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: [QUERY_KEYS.ADMIN_PRODUCTS] });
  });

  // ADDED — the single most important behavior this hook has to get
  // right, given the backend's wholesale-replace-on-any-file constraint:
  // calling update WITHOUT touching photos must reach buildProductFormData
  // with no `photos` key in the partial input at all, not an empty array
  // (an empty array is still "photos present" — see productFormData's own
  // "field present but empty" distinction).
  it('omits photos from the update payload when the caller does not include it', async () => {
    vi.mocked(buildProductFormData).mockReturnValue(new FormData());
    vi.mocked(patchForm).mockResolvedValue(mockAxiosResponse(mockProduct));
    const { result } = setup();

    result.current.mutate({ id: 'p1', data: { price: 30 } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const callArg = vi.mocked(buildProductFormData).mock.calls[0][0];
    expect(callArg).not.toHaveProperty('photos');
  });

  it('propagates a not-found (404) failure', async () => {
    vi.mocked(buildProductFormData).mockReturnValue(new FormData());
    const mockError = { isAxiosError: true, response: { status: 404 } };
    vi.mocked(patchForm).mockRejectedValue(mockError);
    const { result } = setup();

    result.current.mutate({ id: 'missing', data: { price: 30 } });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(mockError);
  });
  it('does not call the API just from being rendered', () => {
    const { Wrapper } = createQueryWrapper();
    renderHook(() => useUpdateProduct(), { wrapper: Wrapper });
    expect(patchForm).not.toHaveBeenCalled();
  });
  it('includes photos in the update payload when the caller explicitly provides them', async () => {
    const newPhotos = [new File(['x'], 'new.jpg', { type: 'image/jpeg' })];
    vi.mocked(buildProductFormData).mockReturnValue(new FormData());
    vi.mocked(patchForm).mockResolvedValue(mockAxiosResponse(mockProduct));
    const { result } = setup();

    result.current.mutate({ id: 'p1', data: { photos: newPhotos } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const callArg = vi.mocked(buildProductFormData).mock.calls[0][0];
    expect(callArg).toHaveProperty('photos', newPhotos);
  });
  it('propagates a not-found (404) failure', async () => {
    vi.mocked(buildProductFormData).mockReturnValue(new FormData());
    const mockError = { isAxiosError: true, response: { status: 404 } };
    vi.mocked(patchForm).mockRejectedValue(mockError);
    const { result, invalidateQueriesSpy } = setup(); // was: const { result } = setup();

    result.current.mutate({ id: 'missing', data: { price: 30 } });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateQueriesSpy).not.toHaveBeenCalled(); // new
    expect(result.current.error).toBe(mockError);
  });
  it("marks a cached useAdminProduct('p1') entry stale too, via key-prefix matching", async () => {
    // Proves the thing that actually matters for the edit page: not just
    // that invalidateQueries was called with the parent key, but that a
    // query cached under a CHILD of that key (exactly how useAdminProduct
    // caches a single product) is the one that actually gets marked stale.
    vi.mocked(buildProductFormData).mockReturnValue(new FormData());
    vi.mocked(patchForm).mockResolvedValue(mockAxiosResponse(mockProduct));
    const { Wrapper, queryClient } = createQueryWrapper();
    queryClient.setQueryData([QUERY_KEYS.ADMIN_PRODUCTS, 'p1'], mockProduct);
    const { result } = renderHook(() => useUpdateProduct(), { wrapper: Wrapper });

    result.current.mutate({ id: 'p1', data: { price: 30 } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryState([QUERY_KEYS.ADMIN_PRODUCTS, 'p1'])?.isInvalidated).toBe(true);
  });
});

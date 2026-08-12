import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAdminProduct } from '@/hooks/useAdminProduct';
import api from '@/lib/axios';
import { createQueryWrapper } from '../test-utils';
import type { Product } from '@/types';

vi.mock('@/lib/axios');

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

describe.skip('useAdminProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /admin/products/:id when an id is provided', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockProduct });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAdminProduct('p1'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/admin/products/p1');
  });

  // CRITICAL — this is what makes the hook safe to call unconditionally
  // in AdminProductFormPage regardless of create vs. edit mode, instead
  // of the page needing its own separate branching logic.
  it('does not call the API at all when id is undefined (create mode)', () => {
    const { Wrapper } = createQueryWrapper();
    renderHook(() => useAdminProduct(undefined), { wrapper: Wrapper });
    expect(api.get).not.toHaveBeenCalled();
  });

  it('resolves with the fetched product, including unpublished ones', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockProduct });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAdminProduct('p1'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockProduct);
  });

  it('surfaces a 404 for a nonexistent product id', async () => {
    const mockError = { isAxiosError: true, response: { status: 404 } };
    vi.mocked(api.get).mockRejectedValue(mockError);
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAdminProduct('missing'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(mockError);
  });

  // ADDED – when the id prop changes from one product to another, the hook
  // must refetch the new product automatically.
  it('refetches when the id changes from one product to another', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockProduct });
    const { Wrapper } = createQueryWrapper();
    // Use the hook's parameter type to prevent literal narrowing
    type IdParam = Parameters<typeof useAdminProduct>[0];

    const { result, rerender } = renderHook((id: IdParam) => useAdminProduct(id), {
      wrapper: Wrapper,
      initialProps: 'p1' as IdParam,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/admin/products/p1');

    // Change to a different id
    rerender('p2');

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
      expect(api.get).toHaveBeenLastCalledWith('/admin/products/p2');
    });
  });

  // ADDED – an empty string id must be treated the same as undefined:
  // no API call is made (create mode).
  it('does not call the API when id is an empty string (create mode)', () => {
    const { Wrapper } = createQueryWrapper();
    renderHook(() => useAdminProduct(''), { wrapper: Wrapper });
    expect(api.get).not.toHaveBeenCalled();
  });

  // ADDED – a non‑Axios rejection (network drop) must be surfaced without
  // crashing the hook.
  it('surfaces a plain Error rejection (non-Axios)', async () => {
    const mockError = new Error('Network Error');
    vi.mocked(api.get).mockRejectedValue(mockError);
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAdminProduct('p1'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(mockError);
  });
});

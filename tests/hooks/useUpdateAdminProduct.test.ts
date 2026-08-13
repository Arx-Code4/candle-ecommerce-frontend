import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUpdateAdminProduct } from '@/hooks/useUpdateAdminProduct';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import { createQueryWrapper } from '../test-utils';
import type { AdminProductSummary } from '@/types';

vi.mock('@/lib/axios');

const updated: AdminProductSummary = {
  id: 'p1',
  name: 'Updated',
  description: 'Nice',
  price: 30,
  isPublished: false,
  primaryPhotoUrl: 'https://cdn.example.com/a.jpg',
  photos: [{ id: 'ph1', url: 'https://cdn.example.com/a.jpg', sortOrder: 0 }],
  variants: [{ id: 'v1', scent: 'Vanilla', size: 'Large', stock: 10 }],
};

const payload = {
  id: 'p1',
  name: 'Updated',
  description: 'Nice',
  price: 30,
  photos: [{ url: 'https://cdn.example.com/a.jpg', sortOrder: 0 }],
  variants: [{ id: 'v1', scent: 'Vanilla', size: 'Large', stock: 10 }],
};

describe('useUpdateAdminProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('PATCHes /admin/products/:id with the full form payload', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: updated });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUpdateAdminProduct(), { wrapper: Wrapper });

    result.current.mutate(payload);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.patch).toHaveBeenCalledWith('/admin/products/p1', {
      name: 'Updated',
      description: 'Nice',
      price: 30,
      photos: payload.photos,
      variants: payload.variants,
    });
  });

  it('invalidates ADMIN_PRODUCTS on success', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: updated });
    const { Wrapper, queryClient } = createQueryWrapper();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useUpdateAdminProduct(), { wrapper: Wrapper });

    result.current.mutate(payload);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({ queryKey: [QUERY_KEYS.ADMIN_PRODUCTS] });
  });
});

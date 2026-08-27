import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCreateAdminProduct } from '@/hooks/useCreateAdminProduct';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import { createQueryWrapper } from '../test-utils';
import type { AdminProductFormValues, AdminProductSummary } from '@/types';

vi.mock('@/lib/axios');

const created: AdminProductSummary = {
  id: 'p1',
  name: 'Candle',
  description: 'Nice',
  price: '25',
  isPublished: false,
  primaryPhotoUrl: 'https://cdn.example.com/a.jpg',
  photos: [{ id: 'ph1', url: 'https://cdn.example.com/a.jpg', sortOrder: 0 }],
  variants: [{ id: 'v1', scent: 'Vanilla', size: 'Large', stock: 10 }],
};

const input: AdminProductFormValues = {
  name: 'Candle',
  description: 'Nice',
  price: 25,
  photos: [{ url: 'https://cdn.example.com/a.jpg', sortOrder: 0 }],
  variants: [{ scent: 'Vanilla', size: 'Large', stock: 10 }],
};

describe('useCreateAdminProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POSTs /admin/products with the form values', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: created });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useCreateAdminProduct(), { wrapper: Wrapper });

    result.current.mutate(input);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.post).toHaveBeenCalledWith('/admin/products', input);
  });

  it('invalidates ADMIN_PRODUCTS on success', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: created });
    const { Wrapper, queryClient } = createQueryWrapper();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCreateAdminProduct(), { wrapper: Wrapper });

    result.current.mutate(input);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({ queryKey: [QUERY_KEYS.ADMIN_PRODUCTS] });
  });

  it('does not call the API just from being rendered', () => {
    const { Wrapper } = createQueryWrapper();
    renderHook(() => useCreateAdminProduct(), { wrapper: Wrapper });
    expect(api.post).not.toHaveBeenCalled();
  });
});

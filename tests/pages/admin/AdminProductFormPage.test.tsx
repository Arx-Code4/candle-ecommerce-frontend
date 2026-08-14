import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminProductFormPage from '@/pages/admin/AdminProductFormPage';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { useCreateAdminProduct } from '@/hooks/useCreateAdminProduct';
import { useUpdateAdminProduct } from '@/hooks/useUpdateAdminProduct';
import { toast } from '@/lib/toast';
import type { AdminProductSummary } from '@/types';

vi.mock('@/hooks/useAdminProducts');
vi.mock('@/hooks/useCreateAdminProduct');
vi.mock('@/hooks/useUpdateAdminProduct');
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

const existing: AdminProductSummary = {
  id: 'p1',
  name: 'Vanilla Candle',
  description: 'Smells nice',
  price: 25,
  isPublished: true,
  primaryPhotoUrl: 'https://example.com/a.jpg',
  photos: [{ id: 'ph1', url: 'https://example.com/a.jpg', sortOrder: 0 }],
  variants: [
    { id: '11111111-1111-4111-8111-111111111111', scent: 'Vanilla', size: 'Large', stock: 5 },
  ],
};

function mockCreate(mutateAsync = vi.fn().mockResolvedValue(existing)) {
  vi.mocked(useCreateAdminProduct).mockReturnValue({
    mutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useCreateAdminProduct>);
  return mutateAsync;
}

function mockUpdate(mutateAsync = vi.fn().mockResolvedValue(existing)) {
  vi.mocked(useUpdateAdminProduct).mockReturnValue({
    mutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateAdminProduct>);
  return mutateAsync;
}

function renderAtPath(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/products" element={<p>Product list</p>} />
        <Route path="/admin/products/new" element={<AdminProductFormPage />} />
        <Route path="/admin/products/:id/edit" element={<AdminProductFormPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminProductFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate();
    mockUpdate();
    vi.mocked(useAdminProducts).mockReturnValue({
      data: { items: [existing], page: 1, limit: 20, total: 1 },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useAdminProducts>);
  });

  describe('create mode', () => {
    it('renders empty name/description/price fields', () => {
      renderAtPath('/admin/products/new');
      expect(screen.getByLabelText(/^name$/i)).toHaveValue('');
      expect(screen.getByLabelText(/price/i)).toHaveDisplayValue('');
    });

    it('starts with one photo row and one variant row', () => {
      renderAtPath('/admin/products/new');
      expect(screen.getByLabelText(/photo url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/scent/i)).toBeInTheDocument();
    });

    it('valid submit calls create, not update', async () => {
      const mutateAsync = mockCreate();
      const user = userEvent.setup();
      renderAtPath('/admin/products/new');

      await user.type(screen.getByLabelText(/^name$/i), 'New Candle');
      await user.type(screen.getByLabelText(/description/i), 'A description');
      await user.type(screen.getByLabelText(/price/i), '20');
      await user.type(screen.getByLabelText(/photo url/i), 'https://cdn.example.com/n.jpg');
      await user.type(screen.getByLabelText(/scent/i), 'Rose');
      await user.type(screen.getByLabelText(/size/i), 'Small');
      await user.clear(screen.getByLabelText(/stock/i));
      await user.type(screen.getByLabelText(/stock/i), '3');
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
      expect(toast.success).toHaveBeenCalledWith('Product created');
    });
  });

  describe('edit mode', () => {
    it('prefills the form from the cached admin product list', () => {
      renderAtPath('/admin/products/p1/edit');
      expect(screen.getByLabelText(/^name$/i)).toHaveValue('Vanilla Candle');
      expect(screen.getByLabelText(/price/i)).toHaveValue(25);
      expect(screen.getByLabelText(/photo url/i)).toHaveValue('https://example.com/a.jpg');
    });

    it('shows a loading state while the list is fetching', () => {
      vi.mocked(useAdminProducts).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      } as unknown as ReturnType<typeof useAdminProducts>);
      renderAtPath('/admin/products/p1/edit');
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('shows not found when the id is missing from the list', () => {
      vi.mocked(useAdminProducts).mockReturnValue({
        data: { items: [], page: 1, limit: 20, total: 0 },
        isLoading: false,
        isError: false,
      } as unknown as ReturnType<typeof useAdminProducts>);
      renderAtPath('/admin/products/missing/edit');
      expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });

    it('submits the full photos and variants arrays with the id', async () => {
      const mutateAsync = mockUpdate();
      const user = userEvent.setup();
      renderAtPath('/admin/products/p1/edit');

      await user.clear(screen.getByLabelText(/price/i));
      await user.type(screen.getByLabelText(/price/i), '30');
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() =>
        expect(mutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'p1',
            price: 30,
            photos: expect.any(Array),
            variants: expect.any(Array),
          })
        )
      );
      const payload = mutateAsync.mock.calls[0][0];
      expect(payload.photos).toHaveLength(1);
      expect(payload.variants).toHaveLength(1);
      expect(toast.success).toHaveBeenCalledWith('Product updated');
    });
  });

  it('surfaces a duplicate scent/size 400 as a root error', async () => {
    const mutateAsync = mockCreate(
      vi.fn().mockRejectedValue({
        isAxiosError: true,
        response: { status: 400, data: { message: 'Duplicate scent/size combination' } },
      })
    );
    const user = userEvent.setup();
    renderAtPath('/admin/products/new');

    await user.type(screen.getByLabelText(/^name$/i), 'Candle');
    await user.type(screen.getByLabelText(/description/i), 'Desc');
    await user.type(screen.getByLabelText(/price/i), '20');
    await user.type(screen.getByLabelText(/photo url/i), 'https://cdn.example.com/n.jpg');
    await user.type(screen.getByLabelText(/scent/i), 'Rose');
    await user.type(screen.getByLabelText(/size/i), 'Small');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mutateAsync).toHaveBeenCalled();
    expect(await screen.findByText(/duplicate scent\/size/i)).toBeInTheDocument();
  });

  it('tells the admin to zero stock instead of deleting a variant on 409', async () => {
    mockCreate(
      vi.fn().mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 409,
          data: { message: 'Cannot remove a variant with existing orders' },
        },
      })
    );
    const user = userEvent.setup();
    renderAtPath('/admin/products/new');

    await user.type(screen.getByLabelText(/^name$/i), 'Candle');
    await user.type(screen.getByLabelText(/description/i), 'Desc');
    await user.type(screen.getByLabelText(/price/i), '20');
    await user.type(screen.getByLabelText(/photo url/i), 'https://cdn.example.com/n.jpg');
    await user.type(screen.getByLabelText(/scent/i), 'Rose');
    await user.type(screen.getByLabelText(/size/i), 'Small');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText(/set that variant/i)).toBeInTheDocument();
  });
});

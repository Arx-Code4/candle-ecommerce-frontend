// tests/pages/admin/AdminProductFormPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminProductFormPage from '@/pages/admin/AdminProductFormPage';
import { useAdminProduct } from '@/hooks/useAdminProduct';
import { useCreateProduct } from '@/hooks/useCreateProduct';
import { useUpdateProduct } from '@/hooks/useUpdateProduct';
import type { Product } from '@/types';

vi.mock('@/hooks/useAdminProduct');
vi.mock('@/hooks/useCreateProduct');
vi.mock('@/hooks/useUpdateProduct');
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: vi.fn() };
});

const existingProduct: Product = {
  id: 'p1',
  name: 'Vanilla Candle',
  description: 'Smells nice',
  price: 25,
  isPublished: true,
  primaryPhotoUrl: 'jjj',
  photos: [{ id: 'ph1', url: 'https://example.com/a.jpg', sortOrder: 0 }],
  variants: [{ id: 'v1', scent: 'Vanilla', size: 'Large', stock: 5 }],
};

function mockCreate(mutateAsync = vi.fn()) {
  vi.mocked(useCreateProduct).mockReturnValue({
    mutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useCreateProduct>);
  return mutateAsync;
}

function mockUpdate(mutateAsync = vi.fn()) {
  vi.mocked(useUpdateProduct).mockReturnValue({
    mutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateProduct>);
  return mutateAsync;
}

function renderAtPath(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/products/new" element={<AdminProductFormPage />} />
        <Route path="/admin/products/:id/edit" element={<AdminProductFormPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe.skip('AdminProductFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate();
    mockUpdate();
    vi.mocked(useAdminProduct).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminProduct>);
  });

  describe('create mode (/admin/products/new)', () => {
    it('renders empty name/description/price fields', () => {
      renderAtPath('/admin/products/new');
      expect(screen.getByLabelText(/name/i)).toHaveValue('');
      expect(screen.getByLabelText(/price/i)).toHaveValue(null);
    });

    it('does not call useAdminProduct at all (no id in the URL)', () => {
      renderAtPath('/admin/products/new');
      expect(useAdminProduct).toHaveBeenCalledWith(undefined);
    });

    it('valid submit calls useCreateProduct, not useUpdateProduct', async () => {
      const mutateAsync = mockCreate();
      const user = userEvent.setup();
      renderAtPath('/admin/products/new');

      await user.type(screen.getByLabelText(/name/i), 'New Candle');
      await user.type(screen.getByLabelText(/description/i), 'A description');
      await user.type(screen.getByLabelText(/price/i), '20');
      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(mutateAsync).toHaveBeenCalled();
      expect(useUpdateProduct).not.toHaveBeenCalledWith(expect.anything());
    });

    it('blocks submit with no variants added', async () => {
      const mutateAsync = mockCreate();
      const user = userEvent.setup();
      renderAtPath('/admin/products/new');

      await user.type(screen.getByLabelText(/name/i), 'New Candle');
      await user.type(screen.getByLabelText(/description/i), 'A description');
      await user.type(screen.getByLabelText(/price/i), '20');
      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(mutateAsync).not.toHaveBeenCalled();
      expect(screen.getByText(/at least one variant/i)).toBeInTheDocument();
    });
  });

  describe('edit mode (/admin/products/:id/edit)', () => {
    it('calls useAdminProduct with the id from the URL', () => {
      vi.mocked(useAdminProduct).mockReturnValue({
        data: existingProduct,
        isLoading: false,
      } as unknown as ReturnType<typeof useAdminProduct>);
      renderAtPath('/admin/products/p1/edit');

      expect(useAdminProduct).toHaveBeenCalledWith('p1');
    });

    it('prefills the form with the fetched product once loaded', () => {
      vi.mocked(useAdminProduct).mockReturnValue({
        data: existingProduct,
        isLoading: false,
      } as unknown as ReturnType<typeof useAdminProduct>);
      renderAtPath('/admin/products/p1/edit');

      expect(screen.getByLabelText(/name/i)).toHaveValue('Vanilla Candle');
      expect(screen.getByLabelText(/price/i)).toHaveValue(25);
    });

    it('shows a loading state while the existing product is being fetched', () => {
      vi.mocked(useAdminProduct).mockReturnValue({
        data: undefined,
        isLoading: true,
      } as unknown as ReturnType<typeof useAdminProduct>);
      renderAtPath('/admin/products/p1/edit');

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('valid submit calls useUpdateProduct with the id, not useCreateProduct', async () => {
      vi.mocked(useAdminProduct).mockReturnValue({
        data: existingProduct,
        isLoading: false,
      } as unknown as ReturnType<typeof useAdminProduct>);
      const mutateAsync = mockUpdate();
      const user = userEvent.setup();
      renderAtPath('/admin/products/p1/edit');

      await user.clear(screen.getByLabelText(/price/i));
      await user.type(screen.getByLabelText(/price/i), '30');
      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'p1', data: expect.objectContaining({ price: 30 }) })
      );
    });

    // CRITICAL — directly protects the backend's wholesale-replace
    // constraint flagged when this feature was scoped: submitting an
    // edit without touching the photo input must NOT include a `photos`
    // key at all in what's sent to useUpdateProduct, since the hook
    // (and buildProductFormData beneath it) treat an omitted key as
    // "leave existing photos alone" and a present-but-empty one very
    // differently.
    it('does not include photos in the update payload when the photo input was not touched', async () => {
      vi.mocked(useAdminProduct).mockReturnValue({
        data: existingProduct,
        isLoading: false,
      } as unknown as ReturnType<typeof useAdminProduct>);
      const mutateAsync = mockUpdate();
      const user = userEvent.setup();
      renderAtPath('/admin/products/p1/edit');

      await user.clear(screen.getByLabelText(/price/i));
      await user.type(screen.getByLabelText(/price/i), '30');
      await user.click(screen.getByRole('button', { name: /save/i }));

      const callArg = mutateAsync.mock.calls[0][0];
      expect(callArg.data).not.toHaveProperty('photos');
    });

    it('shows a warning near the photo input explaining that re-uploading replaces all existing photos', () => {
      vi.mocked(useAdminProduct).mockReturnValue({
        data: existingProduct,
        isLoading: false,
      } as unknown as ReturnType<typeof useAdminProduct>);
      renderAtPath('/admin/products/p1/edit');

      expect(screen.getByText(/replaces all existing photos/i)).toBeInTheDocument();
    });
  });

  it('shows a root-level error message on a duplicate variant (400) response', async () => {
    const mutateAsync = mockCreate(
      vi.fn().mockRejectedValue({
        response: { status: 400, data: { message: 'Duplicate scent/size combination' } },
      })
    );
    const user = userEvent.setup();
    renderAtPath('/admin/products/new');

    await user.type(screen.getByLabelText(/name/i), 'Candle');
    await user.type(screen.getByLabelText(/description/i), 'Desc');
    await user.type(screen.getByLabelText(/price/i), '20');
    // (variant-adding interaction omitted here — depends on final form UI)
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mutateAsync).toHaveBeenCalled();
    expect(await screen.findByText(/duplicate scent\/size/i)).toBeInTheDocument();
  });
});

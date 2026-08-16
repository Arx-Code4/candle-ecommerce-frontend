import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminProductRow from '@/components/common/AdminProductRow';
import { useUpdateAdminProductStatus } from '@/hooks/useUpdateAdminProductStatus';
import type { AdminProductSummary } from '@/types';

vi.mock('@/hooks/useUpdateAdminProductStatus');

const published: AdminProductSummary = {
  id: 'p1',
  name: 'Vanilla Candle',
  description: 'Warm vanilla',
  price: '25',
  isPublished: true,
  primaryPhotoUrl: 'https://cdn.example.com/vanilla.jpg',
  photos: [{ id: 'ph1', url: 'https://cdn.example.com/vanilla.jpg', sortOrder: 0 }],
  variants: [
    { id: 'v1', scent: 'vanilla', size: 'small', stock: 4 },
    { id: 'v2', scent: 'vanilla', size: 'large', stock: 2 },
  ],
};

const mixedStock: AdminProductSummary = {
  ...published,
  id: 'p2',
  name: 'Lavender Candle',
  variants: [
    { id: 'v3', scent: 'lavender', size: 'small', stock: 0 },
    { id: 'v4', scent: 'lavender', size: 'large', stock: 5 },
  ],
};

function renderRow(product: AdminProductSummary) {
  return render(
    <MemoryRouter>
      <AdminProductRow product={product} />
    </MemoryRouter>
  );
}

describe('AdminProductRow', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUpdateAdminProductStatus).mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateAdminProductStatus>);
  });

  it('renders thumbnail, name, and price', () => {
    renderRow(published);
    expect(screen.getByRole('img', { name: 'Vanilla Candle' })).toHaveAttribute(
      'src',
      'https://cdn.example.com/vanilla.jpg'
    );
    expect(screen.getByText(/vanilla candle/i)).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('shows Mixed when some variants are out of stock and others are not', () => {
    renderRow(mixedStock);
    expect(screen.getByText('Mixed')).toBeInTheDocument();
  });

  it('publish toggle calls mutate with the flipped isPublished value', async () => {
    const user = userEvent.setup();
    renderRow(published);
    await user.click(screen.getByRole('button', { name: /unpublish vanilla candle/i }));
    expect(mutate).toHaveBeenCalledWith({ id: 'p1', isPublished: false });
  });

  it('links to the edit page', () => {
    renderRow(published);
    expect(screen.getByRole('link', { name: /edit vanilla candle/i })).toHaveAttribute(
      'href',
      '/admin/products/p1/edit'
    );
  });

  it('disables the toggle while a mutation is in flight', async () => {
    vi.mocked(useUpdateAdminProductStatus).mockReturnValue({
      mutate,
      isPending: true,
    } as unknown as ReturnType<typeof useUpdateAdminProductStatus>);
    const user = userEvent.setup();
    renderRow(published);

    const toggle = screen.getByRole('button', { name: /unpublish vanilla candle/i });
    expect(toggle).toBeDisabled();
    await user.click(toggle);
    expect(mutate).not.toHaveBeenCalled();
  });
});

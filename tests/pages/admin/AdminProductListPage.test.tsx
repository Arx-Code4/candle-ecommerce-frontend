import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminProductListPage from '@/pages/admin/AdminProductListPage';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import type { AdminProductSummary, PaginatedResult } from '@/types';

vi.mock('@/hooks/useAdminProducts');
vi.mock('@/hooks/useUpdateAdminProductStatus', () => ({
  useUpdateAdminProductStatus: () => ({ mutate: vi.fn(), isPending: false }),
}));

const vanilla: AdminProductSummary = {
  id: 'p1',
  name: 'Vanilla Candle',
  description: 'Smells nice',
  price: 25,
  isPublished: true,
  primaryPhotoUrl: 'https://cdn.example.com/v.jpg',
  photos: [],
  variants: [{ id: 'v1', scent: 'Vanilla', size: 'Large', stock: 5 }],
};

const draft: AdminProductSummary = {
  ...vanilla,
  id: 'p2',
  name: 'Draft Candle',
  isPublished: false,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminProductListPage />
    </MemoryRouter>
  );
}

describe('AdminProductListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading state', () => {
    vi.mocked(useAdminProducts).mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
    } as unknown as ReturnType<typeof useAdminProducts>);
    renderPage();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows an error state', () => {
    vi.mocked(useAdminProducts).mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    } as unknown as ReturnType<typeof useAdminProducts>);
    renderPage();
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  it('shows an empty state with an add-product CTA', () => {
    vi.mocked(useAdminProducts).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        items: [],
        page: 1,
        limit: 20,
        total: 0,
      } satisfies PaginatedResult<AdminProductSummary>,
    } as unknown as ReturnType<typeof useAdminProducts>);
    renderPage();
    expect(screen.getByText(/no products/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /add your first product/i })).toHaveAttribute(
      'href',
      '/admin/products/new'
    );
  });

  it('renders one row per product and an Add Product link', () => {
    vi.mocked(useAdminProducts).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: [vanilla, draft], page: 1, limit: 20, total: 2 },
    } as unknown as ReturnType<typeof useAdminProducts>);
    renderPage();
    expect(screen.getByText(/vanilla candle/i)).toBeInTheDocument();
    expect(screen.getByText(/draft candle/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /add product/i })).toHaveAttribute(
      'href',
      '/admin/products/new'
    );
  });
});

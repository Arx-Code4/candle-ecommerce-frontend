import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminProductListPage from '@/pages/admin/AdminProductListPage';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { useUpdateProductStatus } from '@/hooks/useUpdateProductStatus';
import type { Product, PaginatedResult } from '@/types';

vi.mock('@/hooks/useAdminProducts');
vi.mock('@/hooks/useUpdateProductStatus');

function mockList(overrides: Partial<ReturnType<typeof useAdminProducts>> = {}) {
  vi.mocked(useAdminProducts).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...overrides,
  } as ReturnType<typeof useAdminProducts>);
}

function mockStatusMutation(mutate = vi.fn()) {
  vi.mocked(useUpdateProductStatus).mockReturnValue({
    mutate,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateProductStatus>);
  return mutate;
}

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminProductListPage />
    </MemoryRouter>
  );
}

const mockProduct: Product = {
  id: 'p1',
  name: 'Vanilla Candle',
  description: 'Smells nice',
  price: 25,
  isPublished: true,
  photos: [],
  variants: [{ id: 'v1', scent: 'Vanilla', size: 'Large', stock: 5 }],
};

const draftProduct: Product = {
  ...mockProduct,
  id: 'p2',
  name: 'Draft Candle',
  isPublished: false,
};

const populatedResult: PaginatedResult<Product> = {
  items: [mockProduct, draftProduct],
  page: 1,
  limit: 20,
  total: 2,
};

describe.skip('AdminProductListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStatusMutation();
  });

  it('shows a loading state', () => {
    mockList({ isLoading: true });
    renderPage();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows an error state', () => {
    mockList({ isError: true });
    renderPage();
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  it('shows an empty state when there are no products', () => {
    mockList({ data: { items: [], page: 1, limit: 20, total: 0 } });
    renderPage();
    expect(screen.getByText(/no products/i)).toBeInTheDocument();
  });

  it("renders each product's name and price", () => {
    mockList({ data: populatedResult });
    renderPage();

    expect(screen.getByText('Vanilla Candle')).toBeInTheDocument();
    expect(screen.getByText('Draft Candle')).toBeInTheDocument();
  });

  it('shows a published/draft indicator distinguishing the two states', () => {
    mockList({ data: populatedResult });
    renderPage();

    expect(screen.getByText(/vanilla candle/i).closest('*')).toHaveTextContent(/published/i);
    expect(screen.getByText(/draft candle/i).closest('*')).toHaveTextContent(/draft/i);
  });

  it('toggling publish status calls useUpdateProductStatus.mutate with the flipped value', async () => {
    const mutate = mockStatusMutation();
    mockList({ data: populatedResult });
    const user = userEvent.setup();
    renderPage();

    // Draft product's toggle should publish it (false -> true).
    await user.click(screen.getByRole('button', { name: /publish draft candle/i }));

    expect(mutate).toHaveBeenCalledWith({ id: 'p2', isPublished: true });
  });

  it('has a link to create a new product', () => {
    mockList({ data: populatedResult });
    renderPage();
    expect(screen.getByRole('link', { name: /new product/i })).toHaveAttribute(
      'href',
      '/admin/products/new'
    );
  });

  it('has a link to edit each product', () => {
    mockList({ data: populatedResult });
    renderPage();
    expect(screen.getByRole('link', { name: /edit vanilla candle/i })).toHaveAttribute(
      'href',
      '/admin/products/p1/edit'
    );
  });

  // ADDED — pagination is easy to build with the buttons visible but
  // silently wired to the wrong values. Confirms the page actually reads
  // page/total from the hook's response rather than hardcoding.
  it('passes the current page to useAdminProducts and shows total count', () => {
    mockList({ data: { ...populatedResult, page: 2, total: 45 } });
    renderPage();
    expect(useAdminProducts).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
    expect(screen.getByText(/45/)).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import CatalogPage from '@/pages/CatalogPage';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/types';

vi.mock('@/hooks/useProducts');
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useSearchParams: vi.fn() };
});

const products: Product[] = [
  {
    id: 'p1',
    name: 'Vanilla Candle',
    description: 'desc',
    price: 25,
    isPublished: true,
    primaryPhotoUrl: 'jj',
    photos: [],
    variants: [{ id: 'v1', scent: 'vanilla', size: 'large', stock: 5 }],
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <CatalogPage />
    </MemoryRouter>
  );
}

describe('CatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams(),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);
  });

  it('reads scent/size/page from URL and passes to useProducts', () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams('scent=vanilla&page=2'),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(useProducts).mockReturnValue({
      data: { items: products, page: 2, limit: 20, total: 1 },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useProducts>);

    renderPage();
    expect(useProducts).toHaveBeenCalledWith({
      scent: 'vanilla',
      size: undefined,
      page: 2,
      limit: 20,
    });
  });

  it('renders FilterBar and a ProductCard grid on success', () => {
    vi.mocked(useProducts).mockReturnValue({
      data: { items: products, page: 1, limit: 20, total: 1 },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useProducts>);

    renderPage();
    expect(screen.getByRole('navigation', { name: /filter/i })).toBeInTheDocument();
    expect(screen.getByText('Vanilla Candle')).toBeInTheDocument();
  });

  it('pagination controls computed from total/limit', () => {
    vi.mocked(useProducts).mockReturnValue({
      data: { items: products, total: 45, limit: 20, page: 1 },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useProducts>);

    renderPage();
    // Math.ceil(45/20) === 3
    expect(screen.getAllByRole('button', { name: /^[123]$/ })).toHaveLength(3);
  });

  it('loading state shows skeleton on filter/page change', () => {
    vi.mocked(useProducts).mockReturnValue({
      isLoading: true,
      isSuccess: false,
      isError: false,
      data: undefined,
    } as unknown as ReturnType<typeof useProducts>);

    renderPage();
    expect(screen.getAllByTestId(/skeleton/i).length).toBeGreaterThan(0);
  });

  it('empty state when filters match nothing includes "clear filters"', () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams('scent=obscure'),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(useProducts).mockReturnValue({
      data: { items: [], page: 1, limit: 20, total: 0 },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useProducts>);

    renderPage();
    expect(screen.getByText(/no products|no results|nothing found/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
  });

  it('error state', () => {
    vi.mocked(useProducts).mockReturnValue({
      isError: true,
      isLoading: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof useProducts>);

    renderPage();
    expect(screen.getByText(/error|failed|something went wrong/i)).toBeInTheDocument();
  });
});

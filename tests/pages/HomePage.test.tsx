import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/types';

vi.mock('@/hooks/useProducts');

function makeProducts(count: number): Product[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Candle ${i + 1}`,
    description: 'desc',
    price: 20 + i,
    isPublished: true,
    photos: [{ id: `ph${i}`, url: `https://cdn.example.com/${i}.jpg`, sortOrder: 0 }],
    variants: [{ id: `v${i}`, scent: 'vanilla', size: 'large', stock: 5 }],
  }));
}

function renderPage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

describe.skip('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches featured products with limit 8', () => {
    vi.mocked(useProducts).mockReturnValue({
      data: { items: makeProducts(8), page: 1, limit: 8, total: 8 },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useProducts>);

    renderPage();
    expect(useProducts).toHaveBeenCalledWith({ limit: 8 });
  });

  it('renders a ProductCard grid on success', () => {
    vi.mocked(useProducts).mockReturnValue({
      data: { items: makeProducts(8), page: 1, limit: 8, total: 8 },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useProducts>);

    renderPage();
    for (let i = 1; i <= 8; i++) {
      expect(screen.getByText(`Candle ${i}`)).toBeInTheDocument();
    }
  });

  it('loading state shows a skeleton grid', () => {
    vi.mocked(useProducts).mockReturnValue({
      isLoading: true,
      isSuccess: false,
      isError: false,
      data: undefined,
    } as unknown as ReturnType<typeof useProducts>);

    renderPage();
    expect(screen.getAllByTestId(/skeleton/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Candle/)).not.toBeInTheDocument();
  });

  it('error state shows inline error with retry', async () => {
    const refetch = vi.fn();
    vi.mocked(useProducts).mockReturnValue({
      isError: true,
      isLoading: false,
      isSuccess: false,
      refetch,
    } as unknown as ReturnType<typeof useProducts>);

    const user = userEvent.setup();
    renderPage();

    expect(screen.getByText(/error|failed|something went wrong/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('empty state (zero published products) shows EmptyState', () => {
    vi.mocked(useProducts).mockReturnValue({
      data: { items: [], page: 1, limit: 8, total: 0 },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useProducts>);

    renderPage();
    expect(screen.getByText(/no products/i)).toBeInTheDocument();
  });

  it('"Browse full catalog" links to /products', () => {
    vi.mocked(useProducts).mockReturnValue({
      data: { items: makeProducts(2), page: 1, limit: 8, total: 2 },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useProducts>);

    renderPage();
    expect(screen.getByRole('link', { name: /browse full catalog/i })).toHaveAttribute(
      'href',
      '/products'
    );
  });
});

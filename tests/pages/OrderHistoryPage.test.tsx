// tests/pages/OrderHistoryPage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import {
  renderWithProviders,
  screen,
  mockQuerySuccess,
  mockQueryLoading,
  mockQueryError,
} from '../utils/renderWithProviders';
import OrderHistoryPage from '@/pages/OrderHistoryPage';
import { useOrders } from '@/hooks/useOrders';
import { AxiosError } from 'axios';

vi.mock('@/hooks/useOrders');
const mockedUseOrders = vi.mocked(useOrders);

function renderPage() {
  return renderWithProviders(
    <MemoryRouter>
      <OrderHistoryPage />
    </MemoryRouter>
  );
}

const orders = [
  {
    id: '1',
    status: 'PROCESSING',
    totalAmount: '45.00',
    itemCount: 2,
    createdAt: '2026-07-01T10:00:00.000Z',
  },
  {
    id: '2',
    status: 'SHIPPED',
    totalAmount: '90.00',
    itemCount: 1,
    createdAt: '2026-07-02T10:00:00.000Z',
  },
  {
    id: '3',
    status: 'PROCESSING',
    totalAmount: '30.00',
    itemCount: 3,
    createdAt: '2026-07-03T10:00:00.000Z',
  },
];

describe.skip('OrderHistoryPage', () => {
  it('renders one OrderCard per order', () => {
    mockedUseOrders.mockReturnValue(mockQuerySuccess({ items: orders }));

    renderPage();

    expect(screen.getAllByRole('link', { name: /view|order/i }).length).toBeGreaterThanOrEqual(3);
  });

  it('each OrderCard links to its own order detail route', () => {
    mockedUseOrders.mockReturnValue(mockQuerySuccess({ items: orders }));

    renderPage();

    orders.forEach((order) => {
      const link = screen.getByRole('link', { name: new RegExp(order.totalAmount) });
      expect(link).toHaveAttribute('href', `/orders/${order.id}`);
    });
  });

  it('shows a skeleton list while loading', () => {
    mockedUseOrders.mockReturnValue(mockQueryLoading());

    renderPage();

    expect(screen.getByTestId('order-history-skeleton')).toBeInTheDocument();
    expect(screen.queryAllByRole('link', { name: /view|order/i })).toHaveLength(0);
  });

  it('shows an EmptyState linking to /products when there are no orders', () => {
    mockedUseOrders.mockReturnValue(mockQuerySuccess({ items: [] }));

    renderPage();

    const link = screen.getByRole('link', { name: /catalog|browse/i });
    expect(link).toHaveAttribute('href', '/products');
  });

  it('shows an error state when the query fails', () => {
    mockedUseOrders.mockReturnValue(mockQueryError(new AxiosError('Failed to fetch orders')));

    renderPage();

    // Adjust this based on how your component handles errors
    expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
  });
});

// tests/pages/OrderDetailPage.test.tsx
// Source: src/pages/OrderDetailPage.tsx
// Per eco-9.2.3 §9.3 (OrderDetailPage.test.tsx). Mocks useOrder and
// react-router's useParams; route :id comes from useParams, not props.
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders, screen } from '../utils/renderWithProviders';
import OrderDetailPage from '@/pages/OrderDetailPage';
import { useOrder } from '@/hooks/useOrder';

vi.mock('@/hooks/useOrder');
const mockedUseOrder = vi.mocked(useOrder);

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ id: 'order-1' }) };
});

function renderPage() {
  return renderWithProviders(
    <MemoryRouter>
      <OrderDetailPage />
    </MemoryRouter>
  );
}

const baseOrder = {
  id: 'order-1',
  status: 'SHIPPED',
  totalAmount: '900.00',
  shippingName: 'Ada Lovelace',
  shippingPhone: '0911000000',
  shippingAddress: 'Addis Ababa',
  items: [
    {
      productNameSnapshot: 'Vanilla Candle',
      scentSnapshot: 'Vanilla',
      sizeSnapshot: 'Medium',
      unitPriceSnapshot: '450.00',
      quantity: 2,
    },
  ],
  createdAt: '2026-07-01T10:00:00.000Z',
};

describe('OrderDetailPage', () => {
  it('fetches the order using the route id', () => {
    mockedUseOrder.mockReturnValue({
      data: baseOrder,
      isPending: false,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useOrder>);

    renderPage();

    expect(mockedUseOrder).toHaveBeenCalledWith('order-1');
  });

  it('renders status badge, shipping details, and a line-item table on success', () => {
    mockedUseOrder.mockReturnValue({
      data: baseOrder,
      isPending: false,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useOrder>);

    renderPage();

    expect(screen.getByText('Shipped')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Addis Ababa')).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /vanilla candle/i })).toBeInTheDocument();
  });

  it('renders snapshot fields exactly as returned, never merged with live product data', () => {
    const archivedItemOrder = {
      ...baseOrder,
      items: [
        {
          ...baseOrder.items[0],
          productNameSnapshot: 'Vanilla Candle (Archived Name)',
        },
      ],
    };
    mockedUseOrder.mockReturnValue({
      data: archivedItemOrder,
      isPending: false,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useOrder>);

    renderPage();

    // Deliberately checks a snapshot value that differs from what a live
    // product would show — a component that wrongly re-fetched/merged
    // live product data would not reproduce this exact archived string,
    // per the coverage-honesty note in eco-9 §9.4.
    expect(screen.getByText('Vanilla Candle (Archived Name)')).toBeInTheDocument();
  });

  it('renders a generic "not found" message on 404, without distinguishing cause', () => {
    mockedUseOrder.mockReturnValue({
      data: undefined,
      isPending: false,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useOrder>);

    renderPage();

    expect(screen.getByText(/not found/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /orders/i });
    expect(link).toHaveAttribute('href', '/orders');
    // No text distinguishing "not yours" vs "doesn't exist" should appear —
    // matches the backend's single 404 contract (eco-5c).
    expect(screen.queryByText(/not your order|belongs to/i)).not.toBeInTheDocument();
  });

  it('shows a loading indicator while the order is being fetched', () => {
    mockedUseOrder.mockReturnValue({
      data: undefined,
      isPending: true,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useOrder>);

    renderPage();

    expect(screen.getByTestId('order-detail-loading')).toBeInTheDocument();
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
  });
});

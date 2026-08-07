// tests/components/common/OrderCard.test.tsx
// Source: src/components/common/OrderCard.tsx
// Per eco-9.2.3 §9.2 (OrderCard.test.tsx). Presentational, but wraps a
// react-router <Link> — wrapped in MemoryRouter (not the real app
// router, per the guide's anti-pattern rule §11) purely to give that
// Link a routing context to render into.
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders, screen } from '../../utils/renderWithProviders';
import OrderCard from '@/components/common/OrderCard';
import type { OrderSummary } from '@/types';

const baseOrder: OrderSummary = {
  id: 'order-1',
  status: 'PROCESSING',
  totalAmount: '45.00',
  itemCount: 2,
  createdAt: '2026-07-01T10:00:00.000Z',
};

function renderCard(order: OrderSummary) {
  return renderWithProviders(
    <MemoryRouter>
      <OrderCard order={order} />
    </MemoryRouter>
  );
}

describe.skip('OrderCard', () => {
  it('renders date, item count, total, and status badge', () => {
    renderCard(baseOrder);

    expect(screen.getByText('45.00')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
    // date rendering: assert something derived from createdAt is present,
    // without over-specifying exact formatting here.
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('links to its own order detail route', () => {
    renderCard(baseOrder);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/orders/order-1');
  });

  it('renders the total as received, not reformatted', () => {
    renderCard({ ...baseOrder, totalAmount: '45.00' });

    expect(screen.getByText('45.00')).toBeInTheDocument();
  });
});

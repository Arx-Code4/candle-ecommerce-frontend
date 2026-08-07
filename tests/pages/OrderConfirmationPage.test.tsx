// tests/pages/OrderConfirmationPage.test.tsx
// Source: src/pages/OrderConfirmationPage.tsx
// Per eco-9.2.3 §9.3 (OrderConfirmationPage.test.tsx). Deliberately
// data-free page — no hooks to mock, per eco-8's "no API call, no order
// lookup" design decision.
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders, screen } from '../utils/renderWithProviders';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';

function renderPage() {
  return renderWithProviders(
    <MemoryRouter>
      <OrderConfirmationPage />
    </MemoryRouter>
  );
}

describe.skip('OrderConfirmationPage', () => {
  it('renders the static confirmation message with no API call', () => {
    renderPage();

    expect(
      screen.getByText(/we're confirming your payment.*email confirmation.*order history/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument(); // no loading spinner
  });

  it('renders a link to /orders', () => {
    renderPage();

    const link = screen.getByRole('link', { name: /order history/i });
    expect(link).toHaveAttribute('href', '/orders');
  });

  it('has no loading or error states — renders synchronously to its one static state', () => {
    // Nothing to mock: no query/mutation hook is used by this page at all.
    // Rendering without any mocked hook and immediately finding the
    // static content confirms there is no data dependency to exercise.
    renderPage();

    expect(screen.getByText(/we're confirming your payment/i)).toBeInTheDocument();
  });
});

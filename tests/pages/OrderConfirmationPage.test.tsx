import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders, screen } from '../utils/renderWithProviders';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';

function renderPage(initialPath = '/order-confirmation') {
  return renderWithProviders(
    <MemoryRouter initialEntries={[initialPath]}>
      <OrderConfirmationPage />
    </MemoryRouter>
  );
}

describe('OrderConfirmationPage', () => {
  it('renders the static confirmation heading and message with no API call', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: /confirming your payment/i })).toBeInTheDocument();
    expect(
      screen.getByText(/we're confirming your payment.*email confirmation/i)
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
    renderPage();

    expect(screen.getByText(/we're confirming your payment/i)).toBeInTheDocument();
  });

  it('shows the tx_ref from the URL when present', () => {
    renderPage('/order-confirmation?tx_ref=abc123');

    expect(screen.getByText('abc123')).toBeInTheDocument();
    expect(screen.getByText(/reference:/i)).toBeInTheDocument();
  });

  it('renders no reference line when tx_ref is absent', () => {
    renderPage();

    expect(screen.queryByText(/reference:/i)).not.toBeInTheDocument();
  });

  it('shows the same static message regardless of a status query param', () => {
    renderPage('/order-confirmation?status=failed&tx_ref=xyz789');

    expect(screen.getByRole('heading', { name: /confirming your payment/i })).toBeInTheDocument();
  });
});

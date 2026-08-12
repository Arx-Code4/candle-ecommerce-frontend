import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ShopFooter } from '@/components/common/ShopFooter';

function renderFooter() {
  return render(
    <MemoryRouter>
      <ShopFooter />
    </MemoryRouter>
  );
}

describe('ShopFooter', () => {
  it('renders as a footer landmark with the brand blurb', () => {
    renderFooter();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByText(/lumière/i)).toBeInTheDocument();
  });

  it('links to the catalog and order history', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: /all candles/i })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: /order history/i })).toHaveAttribute('href', '/orders');
  });

  it('renders a newsletter signup form without navigating on submit', () => {
    renderFooter();
    const emailInput = screen.getByPlaceholderText(/you@email\.com/i);
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });
});

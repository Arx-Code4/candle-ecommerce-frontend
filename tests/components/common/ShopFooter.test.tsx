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
    expect(screen.getAllByText(/lumière/i).length).toBeGreaterThan(0);
  });

  it('links to the catalog and about us', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: /all candles/i })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: /about us/i })).toHaveAttribute('href', '/about');
  });

  it('renders a contact us CTA', () => {
    renderFooter();
    expect(screen.getAllByRole('link', { name: /contact us/i }).length).toBeGreaterThan(0);
  });
});

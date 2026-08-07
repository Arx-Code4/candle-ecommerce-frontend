import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmptyState from '@/components/common/EmptyState';

describe.skip('EmptyState', () => {
  it('renders message only when no CTA given', () => {
    render(<EmptyState message="No products found" />);
    expect(screen.getByText('No products found')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders CTA when both ctaLabel and ctaHref given', () => {
    render(
      <MemoryRouter>
        <EmptyState message="Cart is empty" ctaLabel="Browse catalog" ctaHref="/products" />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: 'Browse catalog' });
    expect(link).toHaveAttribute('href', '/products');
  });
});


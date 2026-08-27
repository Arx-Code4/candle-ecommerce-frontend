import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '@/components/common/ProductCard';
import type { ProductVariant } from '@/types';

function renderCard(overrides: Partial<Parameters<typeof ProductCard>[0]> = {}) {
  const props = {
    id: 'p1',
    name: 'Vanilla Candle',
    price: '25',
    primaryPhotoUrl: 'https://cdn.example.com/vanilla.jpg',
    variants: [{ id: 'v1', scent: 'vanilla', size: 'large', stock: 3 }] as ProductVariant[],
    ...overrides,
  };
  return render(
    <MemoryRouter>
      <ProductCard {...props} />
    </MemoryRouter>
  );
}

describe('ProductCard', () => {
  it('renders name, price, photo', () => {
    renderCard();
    expect(screen.getByText('Vanilla Candle')).toBeInTheDocument();
    expect(screen.getByText(/25/)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://cdn.example.com/vanilla.jpg');
  });

  it('links to the product detail route', () => {
    renderCard({ id: 'p1' });
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/p1');
  });

  it('inStock true when any variant has stock > 0', () => {
    renderCard({
      variants: [
        { id: 'v1', scent: 'vanilla', size: 'small', stock: 0 },
        { id: 'v2', scent: 'vanilla', size: 'large', stock: 3 },
      ],
    });
    expect(screen.getByText('In Stock')).toBeInTheDocument();
  });

  it('inStock false when all variants are at zero or negative stock', () => {
    renderCard({
      variants: [
        { id: 'v1', scent: 'vanilla', size: 'small', stock: 0 },
        { id: 'v2', scent: 'vanilla', size: 'large', stock: 0 },
      ],
    });
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });
});

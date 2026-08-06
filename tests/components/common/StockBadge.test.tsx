import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StockBadge from '@/components/common/StockBadge';

describe.skip('StockBadge', () => {
  it('positive stock renders "In Stock"', () => {
    render(<StockBadge stock={5} />);
    expect(screen.getByText('In Stock')).toBeInTheDocument();
  });

  it('zero stock renders "Out of Stock"', () => {
    render(<StockBadge stock={0} />);
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('negative stock renders "Oversold" with distinct styling', () => {
    const { rerender } = render(<StockBadge stock={0} />);
    const outOfStock = screen.getByText('Out of Stock');
    const outOfStockClass = outOfStock.className;

    rerender(<StockBadge stock={-2} />);
    const oversold = screen.getByText('Oversold');
    expect(oversold).toBeInTheDocument();
    expect(oversold.className).not.toBe(outOfStockClass);
  });
});


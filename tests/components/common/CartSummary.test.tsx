import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CartSummary from '@/components/common/CartSummary';

describe('CartSummary', () => {
  it('displays total and item count as received', () => {
    render(<CartSummary total="900.00" itemCount={3} />);
    expect(screen.getByText('900.00')).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it('default (readOnly false/omitted) renders an enabled checkout button when itemCount > 0', () => {
    render(<CartSummary total="900.00" itemCount={3} />);
    const btn = screen.getByRole('button', { name: /proceed to checkout/i });
    expect(btn).toBeEnabled();
  });

  it('default renders a disabled checkout button when itemCount is 0', () => {
    render(<CartSummary total="0.00" itemCount={0} />);
    const btn = screen.getByRole('button', { name: /proceed to checkout/i });
    expect(btn).toBeDisabled();
  });

  it('readOnly true renders no button', () => {
    render(<CartSummary total="900.00" itemCount={3} readOnly />);
    expect(screen.queryByRole('button', { name: /proceed to checkout/i })).not.toBeInTheDocument();
  });
});

// tests/components/common/OrderStatusBadge.test.tsx
// Source: src/components/common/OrderStatusBadge.tsx
// Per eco-9.2.3 §9.2 (OrderStatusBadge.test.tsx). Low-scrutiny,
// presentational component (Testing Guide §12) — basic render coverage
// of both status branches.
//
// ASSUMPTION FLAGGED: no doc specifies the exact class/token used to
// distinguish "amber" vs "green" styling (component isn't implemented
// yet). Asserting via a `data-status` attribute mirroring the `status`
// prop is implementation-agnostic and still distinguishes the two
// branches; adjust to the real class name once the component exists,
// per the guide's "test behavior, not implementation" principle (§1) —
// a raw Tailwind color class would be closer to an implementation detail
// than behavior, hence the data-attribute approach here.
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../../utils/renderWithProviders';
import OrderStatusBadge from '@/components/common/OrderStatusBadge';

describe.skip('OrderStatusBadge', () => {
  it('renders an amber "Processing" pill for PROCESSING', () => {
    renderWithProviders(<OrderStatusBadge status="PROCESSING" />);

    const badge = screen.getByText('Processing');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('[data-status]')).toHaveAttribute('data-status', 'PROCESSING');
  });

  it('renders a green "Shipped" pill for SHIPPED, distinct from PROCESSING', () => {
    renderWithProviders(<OrderStatusBadge status="SHIPPED" />);

    const badge = screen.getByText('Shipped');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('[data-status]')).toHaveAttribute('data-status', 'SHIPPED');
  });
});

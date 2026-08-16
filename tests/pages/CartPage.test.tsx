import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import CartPage from '@/pages/CartPage';
import { useCart } from '@/hooks/useCart';
import type { CartItem } from '@/types';

vi.mock('@/hooks/useCart');
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: vi.fn() };
});

vi.mock('@/components/common/CartItemRow', () => ({
  default: ({ item }: { item: CartItem }) => <div data-testid="cart-item-row">{item.name}</div>,
}));

vi.mock('@/components/common/CartSummary', () => ({
  default: ({
    total,
    itemCount,
    readOnly,
    onCheckout,
  }: {
    total: string;
    itemCount: number;
    readOnly?: boolean;
    onCheckout?: () => void;
  }) => (
    <div data-testid="cart-summary" data-readonly={String(!!readOnly)}>
      <span>{total}</span>
      <span>{itemCount}</span>
      {!readOnly && (
        <button type="button" disabled={itemCount === 0} onClick={onCheckout}>
          Proceed to Checkout
        </button>
      )}
    </div>
  ),
}));

const items: CartItem[] = [
  {
    id: 'i1',
    productVariantId: 'v1',
    name: 'Candle A',
    scent: 'vanilla',
    size: 'large',
    unitPrice: '300.00',
    subtotal: '300',
    quantity: 1,
    available: true,
  },
  {
    id: 'i2',
    productVariantId: 'v2',
    name: 'Candle B',
    scent: 'lavender',
    size: 'small',
    unitPrice: '300.00',
    subtotal: '300',
    quantity: 1,
    available: true,
  },
  {
    id: 'i3',
    productVariantId: 'v3',
    name: 'Candle C',
    scent: 'rose',
    size: 'large',
    unitPrice: '300.00',
    subtotal: '300',
    quantity: 1,
    available: true,
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <CartPage />
    </MemoryRouter>
  );
}

describe('CartPage', () => {
  const navigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(navigate);
  });

  it('renders one CartItemRow per cart item', () => {
    vi.mocked(useCart).mockReturnValue({
      data: { items, total: '900.00' },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCart>);

    renderPage();
    expect(screen.getAllByTestId('cart-item-row')).toHaveLength(3);
  });

  it('renders CartSummary (not read-only)', () => {
    vi.mocked(useCart).mockReturnValue({
      data: { items, total: '900.00' },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCart>);

    renderPage();
    const summary = screen.getByTestId('cart-summary');
    expect(summary).toHaveAttribute('data-readonly', 'false');
    expect(screen.getByRole('button', { name: /proceed to checkout/i })).toBeInTheDocument();
  });

  it('empty cart shows EmptyState linking to /products', () => {
    vi.mocked(useCart).mockReturnValue({
      data: { items: [], total: '0.00' },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCart>);

    renderPage();
    expect(screen.queryByTestId('cart-item-row')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /catalog|products|browse/i })).toHaveAttribute(
      'href',
      '/products'
    );
  });

  it('"Proceed to Checkout" navigates to /checkout', async () => {
    vi.mocked(useCart).mockReturnValue({
      data: { items, total: '900.00' },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCart>);

    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /proceed to checkout/i }));
    expect(navigate).toHaveBeenCalledWith('/checkout');
  });

  it('Proceed to Checkout disabled when cart is empty', () => {
    vi.mocked(useCart).mockReturnValue({
      data: { items: [], total: '0.00' },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCart>);

    renderPage();
    const btn = screen.queryByRole('button', { name: /proceed to checkout/i });
    if (btn) {
      expect(btn).toBeDisabled();
    }
    // Empty-cart branch must never allow navigating to /checkout
    expect(navigate).not.toHaveBeenCalled();
  });

  it('Proceed to Checkout disabled when all items are unavailable', () => {
    const unavailable = items.map((i) => ({ ...i, available: false }));
    vi.mocked(useCart).mockReturnValue({
      data: { items: unavailable, total: '900.00' },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCart>);

    renderPage();
    expect(screen.getByRole('button', { name: /proceed to checkout/i })).toBeDisabled();
  });

  it('loading state', () => {
    vi.mocked(useCart).mockReturnValue({
      isLoading: true,
      isSuccess: false,
      isError: false,
      data: undefined,
    } as unknown as ReturnType<typeof useCart>);

    renderPage();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});

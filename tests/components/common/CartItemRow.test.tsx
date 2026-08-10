import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartItemRow from '@/components/common/CartItemRow';
import { useUpdateCartItem } from '@/hooks/useUpdateCartItem';
import { useRemoveCartItem } from '@/hooks/useRemoveCartItem';
import type { CartItem, CartMutationResult } from '@/types';

vi.mock('@/hooks/useUpdateCartItem');
vi.mock('@/hooks/useRemoveCartItem');

const baseItem: CartItem = {
  id: 'item-1',
  productVariantId: 'v1',
  productName: 'Vanilla Candle',
  scent: 'vanilla',
  size: 'large',
  unitPrice: '25.00',
  quantity: 2,
  available: true,
};

describe('CartItemRow', () => {
  const updateMutate = vi.fn();
  const removeMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUpdateCartItem).mockReturnValue({
      mutate: updateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateCartItem>);
    vi.mocked(useRemoveCartItem).mockReturnValue({
      mutate: removeMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useRemoveCartItem>);
  });

  it('renders item details and a quantity stepper', () => {
    render(<CartItemRow item={baseItem} />);
    expect(screen.getByText('Vanilla Candle')).toBeInTheDocument();
    expect(screen.getByText(/25\.00/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  it('clicking + calls useUpdateCartItem with incremented quantity', async () => {
    const user = userEvent.setup();
    render(<CartItemRow item={baseItem} />);
    await user.click(screen.getByRole('button', { name: /\+|increase|increment/i }));
    expect(updateMutate).toHaveBeenCalledWith({ itemId: 'item-1', quantity: 3 });
  });

  it('clicking − calls useUpdateCartItem with decremented quantity', async () => {
    const user = userEvent.setup();
    render(<CartItemRow item={baseItem} />);
    await user.click(screen.getByRole('button', { name: /−|-|decrease|decrement/i }));
    expect(updateMutate).toHaveBeenCalledWith({ itemId: 'item-1', quantity: 1 });
  });

  it('optimistic local echo updates the displayed quantity immediately', async () => {
    updateMutate.mockImplementation(() => {
      /* stays pending — does not resolve synchronously */
    });
    const user = userEvent.setup();
    render(<CartItemRow item={baseItem} />);

    await user.click(screen.getByRole('button', { name: /\+|increase|increment/i }));

    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
  });

  it('remove button calls useRemoveCartItem', async () => {
    const user = userEvent.setup();
    render(<CartItemRow item={baseItem} />);
    await user.click(screen.getByRole('button', { name: /remove/i }));
    expect(removeMutate).toHaveBeenCalledWith({ itemId: 'item-1' });
  });

  it('unavailable item renders greyed out with only a remove action', () => {
    const { container } = render(<CartItemRow item={{ ...baseItem, available: false }} />);
    expect(
      screen.queryByRole('button', { name: /\+|increase|increment/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /−|-|decrease|decrement/i })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    expect(container.firstChild).toHaveClass(/opacity|muted|unavailable|grey|gray/i);
  });

  it('wasCapped true shows a row-local toast', async () => {
    updateMutate.mockImplementation(
      (_vars: unknown, opts?: { onSuccess?: (data: CartMutationResult) => void }) => {
        opts?.onSuccess?.({ cartTotal: '50.00', wasCapped: true, cappedTo: 5 });
      }
    );
    const user = userEvent.setup();
    render(<CartItemRow item={baseItem} />);

    await user.click(screen.getByRole('button', { name: /\+|increase|increment/i }));

    await waitFor(() => {
      expect(screen.getByText(/capped|adjusted|5/i)).toBeInTheDocument();
    });
  });

  it('rapid repeated clicks are disabled mid-flight', async () => {
    let pending = false;
    updateMutate.mockImplementation(() => {
      pending = true;
      vi.mocked(useUpdateCartItem).mockReturnValue({
        mutate: updateMutate,
        isPending: true,
      } as unknown as ReturnType<typeof useUpdateCartItem>);
    });

    const user = userEvent.setup();
    const { rerender } = render(<CartItemRow item={baseItem} />);

    await user.click(screen.getByRole('button', { name: /\+|increase|increment/i }));
    rerender(<CartItemRow item={baseItem} />);

    const plus = screen.getByRole('button', { name: /\+|increase|increment/i });
    expect(plus).toBeDisabled();
    expect(pending).toBe(true);

    await user.click(plus);
    expect(updateMutate).toHaveBeenCalledTimes(1);
  });
});

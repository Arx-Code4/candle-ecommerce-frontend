import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminOrderRow from '@/components/common/AdminOrderRow';
import { useUpdateAdminOrderStatus } from '@/hooks/useUpdateAdminOrderStatus';
import type { AdminOrderSummary } from '@/types';

vi.mock('@/hooks/useUpdateAdminOrderStatus');

const processing: AdminOrderSummary = {
  id: 'o1',
  status: 'PROCESSING',
  customerName: 'Jane Doe',
  customerEmail: 'jane@example.com',
  totalAmount: '900.00',
  itemCount: 2,
  items: [{ id: 'i1', variantId: 'v1', quantity: 2 }],
};

const shipped: AdminOrderSummary = { ...processing, id: 'o2', status: 'SHIPPED' };

describe('AdminOrderRow', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUpdateAdminOrderStatus).mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateAdminOrderStatus>);
  });

  it('renders customer details, total, and status', () => {
    render(<AdminOrderRow order={processing} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText(/900\.00/)).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('shows Mark as Shipped only for PROCESSING orders', () => {
    const { rerender } = render(<AdminOrderRow order={processing} />);
    expect(screen.getByRole('button', { name: /mark o1 as shipped/i })).toBeInTheDocument();

    rerender(<AdminOrderRow order={shipped} />);
    expect(screen.queryByRole('button', { name: /mark o2 as shipped/i })).not.toBeInTheDocument();
  });

  it('clicking Mark as Shipped calls mutate with SHIPPED', async () => {
    const user = userEvent.setup();
    render(<AdminOrderRow order={processing} />);
    await user.click(screen.getByRole('button', { name: /mark o1 as shipped/i }));
    expect(mutate).toHaveBeenCalledWith({ id: 'o1', status: 'SHIPPED' });
  });

  it('disables the action while a mutation is in flight', async () => {
    vi.mocked(useUpdateAdminOrderStatus).mockReturnValue({
      mutate,
      isPending: true,
    } as unknown as ReturnType<typeof useUpdateAdminOrderStatus>);
    const user = userEvent.setup();
    render(<AdminOrderRow order={processing} />);

    const button = screen.getByRole('button', { name: /mark o1 as shipped/i });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(mutate).not.toHaveBeenCalled();
  });
});

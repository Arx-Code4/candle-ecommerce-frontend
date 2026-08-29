import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import type { AdminOrderSummary } from '@/types';

vi.mock('@/hooks/useAdminOrders');
vi.mock('@/hooks/useUpdateAdminOrderStatus', () => ({
  useUpdateAdminOrderStatus: () => ({ mutate: vi.fn(), isPending: false }),
}));

const processing: AdminOrderSummary = {
  id: 'o1',
  status: 'PROCESSING',
  customerName: 'Jane Doe',
  customerEmail: 'jane@example.com',
  totalAmount: '900.00',
  items: [{ id: 'i1', variantId: 'v1', quantity: 2 }],
};

const shipped: AdminOrderSummary = { ...processing, id: 'o2', status: 'SHIPPED' };

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminOrdersPage />
    </MemoryRouter>
  );
}

describe('AdminOrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAdminOrders).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: [processing, shipped], page: 1, limit: 20, total: 2 },
    } as unknown as ReturnType<typeof useAdminOrders>);
  });

  it('shows a loading state', () => {
    vi.mocked(useAdminOrders).mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
    } as unknown as ReturnType<typeof useAdminOrders>);
    renderPage();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows an error state', () => {
    vi.mocked(useAdminOrders).mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    } as unknown as ReturnType<typeof useAdminOrders>);
    renderPage();
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  it('renders customer name for each order', () => {
    renderPage();
    expect(screen.getAllByText('Jane Doe')).toHaveLength(2);
  });

  it('status filter only offers All Orders, Processing, and Shipped', () => {
    renderPage();
    const select = screen.getByLabelText(/filter status/i);
    const options = Array.from(select.querySelectorAll('option')).map((o) => o.textContent);
    expect(options).toEqual(['All Orders', 'Processing', 'Shipped']);
  });

  it('changing the status filter calls useAdminOrders with the new status', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.selectOptions(screen.getByLabelText(/filter status/i), 'PROCESSING');
    expect(useAdminOrders).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'PROCESSING' })
    );
  });

  it('shows an empty state when there are no orders', () => {
    vi.mocked(useAdminOrders).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: [], page: 1, limit: 20, total: 0 },
    } as unknown as ReturnType<typeof useAdminOrders>);
    renderPage();
    expect(screen.getByText(/no orders/i)).toBeInTheDocument();
  });
});

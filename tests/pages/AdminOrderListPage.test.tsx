// tests/pages/admin/AdminOrderListPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminOrderListPage from '@/pages/admin/AdminOrderListPage';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { useUpdateOrderStatus } from '@/hooks/useUpdateOrderStatus';
import type { Order } from '@/types';

vi.mock('@/hooks/useAdminOrders');
vi.mock('@/hooks/useUpdateOrderStatus');

const processingOrder: Order = {
  id: 'o1',
  status: 'PROCESSING',
  customerName: 'Jane Doe',
  customerEmail: 'jane@example.com',
  items: [{ id: 'i1', variantId: 'v1', quantity: 2 }],
};

const shippedOrder: Order = { ...processingOrder, id: 'o2', status: 'SHIPPED' };

function mockList(overrides: Partial<ReturnType<typeof useAdminOrders>> = {}) {
  vi.mocked(useAdminOrders).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...overrides,
  } as ReturnType<typeof useAdminOrders>);
}

function mockStatusMutation(mutate = vi.fn()) {
  vi.mocked(useUpdateOrderStatus).mockReturnValue({
    mutate,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateOrderStatus>);
  return mutate;
}

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminOrderListPage />
    </MemoryRouter>
  );
}

describe.skip('AdminOrderListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStatusMutation();
    mockList({
      data: { items: [processingOrder, shippedOrder], page: 1, limit: 20, total: 2 },
    });
  });

  it('shows a loading state', () => {
    mockList({ isLoading: true });
    renderPage();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows an error state', () => {
    mockList({ isError: true });
    renderPage();
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  it('renders customer name and status for each order', () => {
    renderPage();
    expect(screen.getAllByText('Jane Doe')).toHaveLength(2);
    expect(screen.getByText('PROCESSING')).toBeInTheDocument();
    expect(screen.getByText('SHIPPED')).toBeInTheDocument();
  });

  it('offers a "mark as shipped" action only for PROCESSING orders', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /mark o1 as shipped/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark o2 as shipped/i })).not.toBeInTheDocument();
  });

  it('clicking "mark as shipped" calls mutate with the correct id and status', async () => {
    const mutate = mockStatusMutation();
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /mark o1 as shipped/i }));

    expect(mutate).toHaveBeenCalledWith({ id: 'o1', status: 'SHIPPED' });
  });

  it('the status filter only offers PROCESSING and SHIPPED, matching the backend enum', () => {
    renderPage();
    const select = screen.getByLabelText(/filter by status/i);
    const options = Array.from(select.querySelectorAll('option')).map((o) => o.textContent);

    expect(options).toEqual(expect.arrayContaining(['All', 'PROCESSING', 'SHIPPED']));
    expect(options).not.toEqual(expect.arrayContaining(['DELIVERED', 'CANCELLED']));
  });

  it('changing the status filter calls useAdminOrders with the new status', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(screen.getByLabelText(/filter by status/i), 'SHIPPED');

    expect(useAdminOrders).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'SHIPPED' }));
  });

  it('shows an empty state when there are no orders', () => {
    mockList({ data: { items: [], page: 1, limit: 20, total: 0 } });
    renderPage();
    expect(screen.getByText(/no orders/i)).toBeInTheDocument();
  });
});

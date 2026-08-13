import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import type { User } from '@/types';

vi.mock('@/hooks/useAuth');

const admin: User = {
  id: 'u1',
  email: 'admin@x.com',
  role: 'ADMIN',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const logout = vi.fn();

function renderLayout() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AdminLayout />,
        children: [{ index: true, element: <p>Admin child</p> }],
      },
    ],
    { initialEntries: ['/'] }
  );
  return render(<RouterProvider router={router} />);
}

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      accessToken: 'at-1',
      user: admin,
      isRestoringSession: false,
      logout,
      isLoggingOut: false,
    } as ReturnType<typeof useAuth>);
  });

  it('renders sidebar links, logout, and the matched child route', () => {
    renderLayout();
    expect(screen.getByRole('link', { name: /products/i })).toHaveAttribute(
      'href',
      ROUTES.ADMIN_PRODUCTS
    );
    expect(screen.getByRole('link', { name: /orders/i })).toHaveAttribute(
      'href',
      ROUTES.ADMIN_ORDERS
    );
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    expect(screen.getByText('Admin child')).toBeInTheDocument();
  });

  it('calls logout from useAuth', async () => {
    const user = userEvent.setup();
    renderLayout();
    await user.click(screen.getByRole('button', { name: /logout/i }));
    expect(logout).toHaveBeenCalled();
  });
});

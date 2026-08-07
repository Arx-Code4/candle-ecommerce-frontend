import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import AdminRoute from '@/routes/AdminRoute';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants';
import type { User } from '@/types';

vi.mock('@/store/auth.store');

const adminUser: User = {
  id: 'u1',
  email: 'admin@x.com',
  role: 'ADMIN',
  createdAt: '2026-01-01T00:00:00.000Z',
};
const customerUser: User = { ...adminUser, id: 'u2', role: 'CUSTOMER' };

function renderWithAuthState(accessToken: string | null, user: User | null) {
  vi.mocked(useAuthStore).mockImplementation((selector) =>
    selector({ accessToken, user } as unknown as ReturnType<typeof useAuthStore.getState>)
  );

  const router = createMemoryRouter(
    [
      {
        element: <AdminRoute />,
        children: [{ path: ROUTES.ADMIN_PRODUCTS, element: <p>Admin area</p> }],
      },
      { path: ROUTES.LOGIN, element: <p>Login page</p> },
      { path: ROUTES.HOME, element: <p>Home page</p> },
    ],
    { initialEntries: [ROUTES.ADMIN_PRODUCTS] }
  );

  return render(<RouterProvider router={router} />);
}

describe('AdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /login when there is no access token', () => {
    renderWithAuthState(null, null);
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('redirects to / when authenticated but not an admin', () => {
    renderWithAuthState('at-1', customerUser);
    expect(screen.getByText('Home page')).toBeInTheDocument();
  });

  it('renders the nested route for an authenticated admin', () => {
    renderWithAuthState('at-1', adminUser);
    expect(screen.getByText('Admin area')).toBeInTheDocument();
  });

  // ADDED — the guard checks accessToken first, user.role second. This
  // confirms the order doesn't accidentally let a missing/malformed user
  // object slip through if somehow a token exists without a matching user
  // (shouldn't happen in practice, but the check should still be safe).
  it('redirects to / when there is a token but no user object at all', () => {
    renderWithAuthState('at-1', null);
    expect(screen.getByText('Home page')).toBeInTheDocument();
  });
});

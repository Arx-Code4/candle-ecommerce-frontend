import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import AdminRoute from '@/routes/AdminRoute';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import type { User } from '@/types';

vi.mock('@/hooks/useAuth');

const adminUser: User = {
  id: 'u1',
  email: 'admin@x.com',
  role: 'ADMIN',
  createdAt: '2026-01-01T00:00:00.000Z',
};
const customerUser: User = { ...adminUser, id: 'u2', role: 'CUSTOMER' };

function renderWithAuth(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  vi.mocked(useAuth).mockReturnValue({
    accessToken: null,
    user: null,
    isRestoringSession: false,
    logout: vi.fn(),
    isLoggingOut: false,
    ...overrides,
  } as ReturnType<typeof useAuth>);

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

  it('renders a loader while the session is restoring', () => {
    renderWithAuth({ accessToken: 'at-1', user: null, isRestoringSession: true });
    expect(screen.getByText(/loading session/i)).toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
    expect(screen.queryByText('Home page')).not.toBeInTheDocument();
  });

  it('redirects to /login when there is no access token', () => {
    renderWithAuth({ accessToken: null, user: null });
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('redirects to / when authenticated but not an admin', () => {
    renderWithAuth({ accessToken: 'at-1', user: customerUser });
    expect(screen.getByText('Home page')).toBeInTheDocument();
  });

  it('renders the nested route for an authenticated admin', () => {
    renderWithAuth({ accessToken: 'at-1', user: adminUser });
    expect(screen.getByText('Admin area')).toBeInTheDocument();
  });

  it('redirects to / when there is a token but no user object after restore', () => {
    renderWithAuth({ accessToken: 'at-1', user: null, isRestoringSession: false });
    expect(screen.getByText('Home page')).toBeInTheDocument();
  });
});

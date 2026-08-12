import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/useLogout';
import type { Cart } from '@/types';

vi.mock('@/hooks/useCart');
vi.mock('@/store/auth.store');
vi.mock('@/hooks/useLogout');

function renderLayout() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <DashboardLayout />,
        children: [{ index: true, element: <div>Child route content</div> }],
      },
    ],
    { initialEntries: ['/'] }
  );
  return render(<RouterProvider router={router} />);
}

const logoutMock = vi.fn();

describe('DashboardLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Every route behind this layout is already ProtectedRoute-gated, so
    // there's no "anonymous visitor" case to test here, unlike ShopLayout.
    vi.mocked(useAuthStore).mockImplementation((selector) =>
      selector({
        accessToken: 'abc',
        user: { id: 'u1', email: 'shopper@example.com' },
      } as unknown as ReturnType<typeof useAuthStore.getState>)
    );
    vi.mocked(useCart).mockReturnValue({
      data: { items: [], total: '0.00' } satisfies Cart,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCart>);
    vi.mocked(useLogout).mockReturnValue({
      mutate: logoutMock,
      isPending: false,
    } as unknown as ReturnType<typeof useLogout>);
  });

  it('renders header, nav, footer, and the matched child route', () => {
    renderLayout();
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /catalog/i })).toBeInTheDocument();
    expect(screen.getByText('Child route content')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('shows the authenticated user\'s email as the account control, not "Login"', () => {
    renderLayout();
    expect(screen.getByText('shopper@example.com')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^login$/i })).not.toBeInTheDocument();
  });

  it('calls logout when the account control is clicked', async () => {
    renderLayout();
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();

    await user.click(screen.getByText('shopper@example.com'));
    expect(logoutMock).toHaveBeenCalled();
  });

  it('disables the account control while logging out', () => {
    vi.mocked(useLogout).mockReturnValue({
      mutate: logoutMock,
      isPending: true,
    } as unknown as ReturnType<typeof useLogout>);

    renderLayout();
    expect(screen.getByText(/logging out/i)).toBeDisabled();
  });

  it('cart badge shows item count', () => {
    vi.mocked(useCart).mockReturnValue({
      data: { items: [{ id: '1' }, { id: '2' }], total: '40.00' },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCart>);

    renderLayout();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

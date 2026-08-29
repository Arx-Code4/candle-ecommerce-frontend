import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import ShopLayout from '@/components/layouts/ShopLayout';
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
        element: <ShopLayout />,
        children: [{ index: true, element: <div>Child route content</div> }],
      },
    ],
    { initialEntries: ['/'] }
  );
  return render(<RouterProvider router={router} />);
}

describe('ShopLayout', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockImplementation((selector) => {
      const state = { accessToken: 'abc' } as unknown as ReturnType<typeof useAuthStore.getState>;
      return selector ? selector(state) : state;
    });
    vi.mocked(useCart).mockReturnValue({
      data: { items: [], total: '0.00' } satisfies Cart,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCart>);
    vi.mocked(useLogout).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useLogout>);
  });

  it('renders header, nav, footer, and the matched child route', () => {
    renderLayout();
    expect(screen.getAllByRole('link', { name: /home/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /products/i })).toBeInTheDocument();
    expect(screen.getByText('Child route content')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('cart badge shows item count when authenticated with items', () => {
    vi.mocked(useCart).mockReturnValue({
      data: {
        items: [{ id: '1' }, { id: '2' }, { id: '3' }],
        total: '75.00',
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCart>);

    renderLayout();
    expect(screen.getByText('Cart (3)')).toBeInTheDocument();
  });

  it('cart badge shows 0/hidden when cart has no items', () => {
    vi.mocked(useCart).mockReturnValue({
      data: { items: [], total: '0.00' },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCart>);

    renderLayout();
    expect(screen.getByText('Cart (0)')).toBeInTheDocument();
  });

  it('does not call/throw on useCart for anonymous visitors', () => {
    vi.mocked(useAuthStore).mockImplementation((selector) => {
      const state = { accessToken: null } as unknown as ReturnType<typeof useAuthStore.getState>;
      return selector ? selector(state) : state;
    });
    vi.mocked(useCart).mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useCart>);

    expect(() => renderLayout()).not.toThrow();
    expect(screen.queryByText(/401|unauthorized|error/i)).not.toBeInTheDocument();
  });
});

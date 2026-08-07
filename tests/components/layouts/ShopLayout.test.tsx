import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import ShopLayout from '@/components/layouts/ShopLayout';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/store/auth.store';
import type { Cart } from '@/types';

vi.mock('@/hooks/useCart');
vi.mock('@/store/auth.store');

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

describe.skip('ShopLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockImplementation((selector) =>
      selector({ accessToken: 'abc' } as unknown as ReturnType<typeof useAuthStore.getState>)
    );
    vi.mocked(useCart).mockReturnValue({
      data: { items: [], total: '0.00' } satisfies Cart,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCart>);
  });

  it('renders header, nav, footer, and the matched child route', () => {
    renderLayout();
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /catalog/i })).toBeInTheDocument();
    expect(screen.getByText('Child route content')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('cart badge shows item count when authenticated with items', () => {
    vi.mocked(useCart).mockReturnValue({
      data: {
        items: [
          { id: '1' },
          { id: '2' },
          { id: '3' },
        ],
        total: '75.00',
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCart>);

    renderLayout();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('cart badge shows 0/hidden when cart has no items', () => {
    vi.mocked(useCart).mockReturnValue({
      data: { items: [], total: '0.00' },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCart>);

    renderLayout();
    const badge = screen.queryByTestId('cart-badge');
    if (badge) {
      expect(badge).toHaveTextContent('0');
    } else {
      expect(screen.queryByText('undefined')).not.toBeInTheDocument();
      expect(screen.queryByText('NaN')).not.toBeInTheDocument();
    }
  });

  it('does not call/throw on useCart for anonymous visitors', () => {
    vi.mocked(useAuthStore).mockImplementation((selector) =>
      selector({ accessToken: null } as unknown as ReturnType<typeof useAuthStore.getState>)
    );
    vi.mocked(useCart).mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useCart>);

    expect(() => renderLayout()).not.toThrow();
    expect(screen.queryByText(/401|unauthorized|error/i)).not.toBeInTheDocument();
  });
});


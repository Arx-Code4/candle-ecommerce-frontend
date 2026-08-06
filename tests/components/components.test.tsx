// eco-9.2.2 Shop (Catalog & Cart) — component tests (combined, skipped)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, createMemoryRouter, RouterProvider, useSearchParams } from 'react-router-dom';
import StockBadge from '@/components/common/StockBadge';
import ProductCard from '@/components/common/ProductCard';
import EmptyState from '@/components/common/EmptyState';
import PhotoGallery from '@/components/common/PhotoGallery';
import VariantSelector from '@/components/common/VariantSelector';
import FilterBar from '@/components/common/FilterBar';
import CartItemRow from '@/components/common/CartItemRow';
import CartSummary from '@/components/common/CartSummary';
import ShopLayout from '@/components/layouts/ShopLayout';
import { useUpdateCartItem } from '@/hooks/useUpdateCartItem';
import { useRemoveCartItem } from '@/hooks/useRemoveCartItem';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/store/auth.store';
import type { Cart, CartItem, CartMutationResult, ProductPhoto, ProductVariant } from '@/types';

vi.mock('@/hooks/useUpdateCartItem');
vi.mock('@/hooks/useRemoveCartItem');
vi.mock('@/hooks/useCart');
vi.mock('@/store/auth.store');
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useSearchParams: vi.fn() };
});

describe.skip('StockBadge', () => {
  it('positive stock renders "In Stock"', () => {
    render(<StockBadge stock={5} />);
    expect(screen.getByText('In Stock')).toBeInTheDocument();
  });

  it('zero stock renders "Out of Stock"', () => {
    render(<StockBadge stock={0} />);
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('negative stock renders "Oversold" with distinct styling', () => {
    const { rerender } = render(<StockBadge stock={0} />);
    const outOfStock = screen.getByText('Out of Stock');
    const outOfStockClass = outOfStock.className;

    rerender(<StockBadge stock={-2} />);
    const oversold = screen.getByText('Oversold');
    expect(oversold).toBeInTheDocument();
    expect(oversold.className).not.toBe(outOfStockClass);
  });
});

function renderCard(overrides: Partial<Parameters<typeof ProductCard>[0]> = {}) {
  const props = {
    id: 'p1',
    name: 'Vanilla Candle',
    price: 25,
    primaryPhotoUrl: 'https://cdn.example.com/vanilla.jpg',
    variants: [{ id: 'v1', scent: 'vanilla', size: 'large', stock: 3 }] as ProductVariant[],
    ...overrides,
  };
  return render(
    <MemoryRouter>
      <ProductCard {...props} />
    </MemoryRouter>
  );
}

describe.skip('ProductCard', () => {
  it('renders name, price, photo', () => {
    renderCard();
    expect(screen.getByText('Vanilla Candle')).toBeInTheDocument();
    expect(screen.getByText(/25/)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://cdn.example.com/vanilla.jpg'
    );
  });

  it('links to the product detail route', () => {
    renderCard({ id: 'p1' });
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/p1');
  });

  it('inStock true when any variant has stock > 0', () => {
    renderCard({
      variants: [
        { id: 'v1', scent: 'vanilla', size: 'small', stock: 0 },
        { id: 'v2', scent: 'vanilla', size: 'large', stock: 3 },
      ],
    });
    expect(screen.getByText('In Stock')).toBeInTheDocument();
  });

  it('inStock false when all variants are at zero or negative stock', () => {
    renderCard({
      variants: [
        { id: 'v1', scent: 'vanilla', size: 'small', stock: 0 },
        { id: 'v2', scent: 'vanilla', size: 'large', stock: 0 },
      ],
    });
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });
});

describe.skip('EmptyState', () => {
  it('renders message only when no CTA given', () => {
    render(<EmptyState message="No products found" />);
    expect(screen.getByText('No products found')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders CTA when both ctaLabel and ctaHref given', () => {
    render(
      <MemoryRouter>
        <EmptyState message="Cart is empty" ctaLabel="Browse catalog" ctaHref="/products" />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: 'Browse catalog' });
    expect(link).toHaveAttribute('href', '/products');
  });
});

const photos: ProductPhoto[] = [
  { id: 'ph1', url: 'https://cdn.example.com/p1.jpg', sortOrder: 0 },
  { id: 'ph2', url: 'https://cdn.example.com/p2.jpg', sortOrder: 1 },
  { id: 'ph3', url: 'https://cdn.example.com/p3.jpg', sortOrder: 2 },
];

describe.skip('PhotoGallery', () => {
  it('renders the first photo large by default', () => {
    render(<PhotoGallery photos={photos} />);
    const main = screen.getByRole('img', { name: /main|selected|large|primary/i });
    expect(main).toHaveAttribute('src', photos[0].url);
  });

  it('clicking a thumbnail updates the large image', async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={photos} />);

    const thumbs = screen.getAllByRole('img');
    // Click the thumbnail for p3 (last photo)
    await user.click(thumbs[thumbs.length - 1]);

    const main = screen.getByRole('img', { name: /main|selected|large|primary/i });
    expect(main).toHaveAttribute('src', photos[2].url);
  });

  it('empty photos array renders a placeholder, not a crash', () => {
    expect(() => render(<PhotoGallery photos={[]} />)).not.toThrow();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});

const gridVariants: ProductVariant[] = [
  { id: 'v1', scent: 'vanilla', size: 'small', stock: 5 },
  { id: 'v2', scent: 'vanilla', size: 'large', stock: 3 },
  { id: 'v3', scent: 'lavender', size: 'small', stock: 2 },
  { id: 'v4', scent: 'lavender', size: 'large', stock: 0 },
];

// Missing lavender+large pairing entirely (not just zero stock)
const incompleteVariants: ProductVariant[] = [
  { id: 'v1', scent: 'vanilla', size: 'small', stock: 5 },
  { id: 'v2', scent: 'vanilla', size: 'large', stock: 3 },
  { id: 'v3', scent: 'lavender', size: 'small', stock: 2 },
];

describe.skip('VariantSelector', () => {
  const onSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders distinct scent and size options', () => {
    render(<VariantSelector variants={gridVariants} onSelect={onSelect} />);
    expect(screen.getByRole('option', { name: /vanilla/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /lavender/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /small/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /large/i })).toBeInTheDocument();
    // Deduplicated: 2 scents + 2 sizes, not one option per variant row
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });

  it('disables a combination with no matching variant', async () => {
    const user = userEvent.setup();
    render(<VariantSelector variants={incompleteVariants} onSelect={onSelect} />);

    await user.click(screen.getByRole('option', { name: /lavender/i }));
    expect(screen.getByRole('option', { name: /large/i })).toBeDisabled();
  });

  it('disables a combination whose variant has zero stock', async () => {
    const user = userEvent.setup();
    render(<VariantSelector variants={gridVariants} onSelect={onSelect} />);

    await user.click(screen.getByRole('option', { name: /lavender/i }));
    expect(screen.getByRole('option', { name: /large/i })).toBeDisabled();
  });

  it('calls onSelect only when both scent and size resolve to exactly one variant', async () => {
    const user = userEvent.setup();
    render(<VariantSelector variants={gridVariants} onSelect={onSelect} />);

    await user.click(screen.getByRole('option', { name: /vanilla/i }));
    expect(onSelect).not.toHaveBeenCalled();

    await user.click(screen.getByRole('option', { name: /small/i }));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'v1', scent: 'vanilla', size: 'small' })
    );
  });

  it('single-variant product auto-selects on mount', () => {
    const single: ProductVariant[] = [
      { id: 'only', scent: 'vanilla', size: 'large', stock: 4 },
    ];
    render(<VariantSelector variants={single} onSelect={onSelect} />);
    expect(onSelect).toHaveBeenCalledWith(single[0]);
  });

  it('out-of-stock sizes under a selected scent still show as visible-but-disabled', async () => {
    const allOut: ProductVariant[] = [
      { id: 'v1', scent: 'vanilla', size: 'small', stock: 0 },
      { id: 'v2', scent: 'vanilla', size: 'large', stock: 0 },
    ];
    const user = userEvent.setup();
    render(<VariantSelector variants={allOut} onSelect={onSelect} />);

    await user.click(screen.getByRole('option', { name: /vanilla/i }));

    const small = screen.getByRole('option', { name: /small/i });
    const large = screen.getByRole('option', { name: /large/i });
    expect(small).toBeVisible();
    expect(large).toBeVisible();
    expect(small).toBeDisabled();
    expect(large).toBeDisabled();
  });
});

describe.skip('FilterBar', () => {
  const setSearchParams = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockParams(query: string) {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams(query),
      setSearchParams,
    ] as unknown as ReturnType<typeof useSearchParams>);
  }

  it('reads current scent/size from URL', () => {
    mockParams('scent=vanilla');
    render(<FilterBar />);
    const vanilla = screen.getByRole('button', { name: /vanilla/i });
    expect(vanilla).toHaveAttribute('aria-pressed', 'true');
  });

  it('selecting a new filter value merges into search params and resets page', async () => {
    mockParams('scent=vanilla&page=3');
    const user = userEvent.setup();
    render(<FilterBar />);

    await user.click(screen.getByRole('button', { name: /large/i }));

    expect(setSearchParams).toHaveBeenCalled();
    const next = setSearchParams.mock.calls[0][0] as URLSearchParams | Record<string, string>;
    const params =
      next instanceof URLSearchParams ? next : new URLSearchParams(next as Record<string, string>);
    expect(params.get('size')).toBe('large');
    expect(params.get('page')).toBe('1');
    expect(params.get('scent')).toBe('vanilla');
  });

  it('selecting the already-active filter value toggles it off', async () => {
    mockParams('scent=vanilla');
    const user = userEvent.setup();
    render(<FilterBar />);

    await user.click(screen.getByRole('button', { name: /vanilla/i }));

    expect(setSearchParams).toHaveBeenCalled();
    const next = setSearchParams.mock.calls[0][0] as URLSearchParams | Record<string, string>;
    const params =
      next instanceof URLSearchParams ? next : new URLSearchParams(next as Record<string, string>);
    expect(params.get('scent')).toBeNull();
  });

  it('clear filters removes scent/size but not page', async () => {
    mockParams('scent=vanilla&size=large&page=2');
    const user = userEvent.setup();
    render(<FilterBar />);

    await user.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(setSearchParams).toHaveBeenCalled();
    const next = setSearchParams.mock.calls[0][0] as URLSearchParams | Record<string, string>;
    const params =
      next instanceof URLSearchParams ? next : new URLSearchParams(next as Record<string, string>);
    expect(params.get('scent')).toBeNull();
    expect(params.get('size')).toBeNull();
    expect(params.get('page')).toBe('2');
  });
});

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

describe.skip('CartItemRow', () => {
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
    const { container } = render(
      <CartItemRow item={{ ...baseItem, available: false }} />
    );
    expect(screen.queryByRole('button', { name: /\+|increase|increment/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /−|-|decrease|decrement/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    expect(container.firstChild).toHaveClass(/opacity|muted|unavailable|grey|gray/i);
  });

  it('wasCapped true shows a row-local toast', async () => {
    updateMutate.mockImplementation(
      (
        _vars: unknown,
        opts?: { onSuccess?: (data: CartMutationResult) => void }
      ) => {
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

describe.skip('CartSummary', () => {
  it('displays total and item count as received', () => {
    render(<CartSummary total="900.00" itemCount={3} />);
    expect(screen.getByText('900.00')).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it('default (readOnly false/omitted) renders an enabled checkout button when itemCount > 0', () => {
    render(<CartSummary total="900.00" itemCount={3} />);
    const btn = screen.getByRole('button', { name: /proceed to checkout/i });
    expect(btn).toBeEnabled();
  });

  it('default renders a disabled checkout button when itemCount is 0', () => {
    render(<CartSummary total="0.00" itemCount={0} />);
    const btn = screen.getByRole('button', { name: /proceed to checkout/i });
    expect(btn).toBeDisabled();
  });

  it('readOnly true renders no button', () => {
    render(<CartSummary total="900.00" itemCount={3} readOnly />);
    expect(
      screen.queryByRole('button', { name: /proceed to checkout/i })
    ).not.toBeInTheDocument();
  });
});

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


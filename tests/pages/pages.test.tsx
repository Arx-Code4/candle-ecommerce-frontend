// eco-9.2.2 Shop (Catalog & Cart) — page tests (combined, skipped)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import HomePage from '@/pages/HomePage';
import CatalogPage from '@/pages/CatalogPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import { useProducts } from '@/hooks/useProducts';
import { useProduct } from '@/hooks/useProduct';
import { useAddCartItem } from '@/hooks/useAddCartItem';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/store/auth.store';
import type { CartItem, Product, ProductVariant } from '@/types';

vi.mock('@/hooks/useProducts');
vi.mock('@/hooks/useProduct');
vi.mock('@/hooks/useAddCartItem');
vi.mock('@/hooks/useCart');
vi.mock('@/store/auth.store');
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(),
  };
});


const variantSelectorMocks = vi.hoisted(() => ({
  lastOnSelect: null as null | ((v: ProductVariant | null) => void),
}));

vi.mock('@/components/common/VariantSelector', () => ({
  default: ({
    variants,
    onSelect,
  }: {
    variants: ProductVariant[];
    onSelect: (v: ProductVariant | null) => void;
  }) => {
    variantSelectorMocks.lastOnSelect = onSelect;
    return (
      <div data-testid="variant-selector">
        {variants.map((v) => (
          <span key={v.id}>{v.scent}</span>
        ))}
      </div>
    );
  },
}));

vi.mock('@/components/common/PhotoGallery', () => ({
  default: ({ photos }: { photos: { url: string }[] }) => (
    <div data-testid="photo-gallery">{photos.length} photos</div>
  ),
}));

vi.mock('@/components/common/CartItemRow', () => ({
  default: ({ item }: { item: CartItem }) => (
    <div data-testid="cart-item-row">{item.productName}</div>
  ),
}));

vi.mock('@/components/common/CartSummary', () => ({
  default: ({
    total,
    itemCount,
    readOnly,
    onCheckout,
  }: {
    total: string;
    itemCount: number;
    readOnly?: boolean;
    onCheckout?: () => void;
  }) => (
    <div data-testid="cart-summary" data-readonly={String(!!readOnly)}>
      <span>{total}</span>
      <span>{itemCount}</span>
      {!readOnly && (
        <button type="button" disabled={itemCount === 0} onClick={onCheckout}>
          Proceed to Checkout
        </button>
      )}
    </div>
  ),
}));

function makeProducts(count: number): Product[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Candle ${i + 1}`,
    description: 'desc',
    price: 20 + i,
    isPublished: true,
    photos: [{ id: `ph${i}`, url: `https://cdn.example.com/${i}.jpg`, sortOrder: 0 }],
    variants: [{ id: `v${i}`, scent: 'vanilla', size: 'large', stock: 5 }],
  }));
}

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

describe.skip('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches featured products with limit 8', () => {
    vi.mocked(useProducts).mockReturnValue({
      data: { items: makeProducts(8), page: 1, limit: 8, total: 8 },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useProducts>);

    renderHomePage();
    expect(useProducts).toHaveBeenCalledWith({ limit: 8 });
  });

  it('renders a ProductCard grid on success', () => {
    vi.mocked(useProducts).mockReturnValue({
      data: { items: makeProducts(8), page: 1, limit: 8, total: 8 },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useProducts>);

    renderHomePage();
    for (let i = 1; i <= 8; i++) {
      expect(screen.getByText(`Candle ${i}`)).toBeInTheDocument();
    }
  });

  it('loading state shows a skeleton grid', () => {
    vi.mocked(useProducts).mockReturnValue({
      isLoading: true,
      isSuccess: false,
      isError: false,
      data: undefined,
    } as unknown as ReturnType<typeof useProducts>);

    renderHomePage();
    expect(screen.getAllByTestId(/skeleton/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Candle/)).not.toBeInTheDocument();
  });

  it('error state shows inline error with retry', async () => {
    const refetch = vi.fn();
    vi.mocked(useProducts).mockReturnValue({
      isError: true,
      isLoading: false,
      isSuccess: false,
      refetch,
    } as unknown as ReturnType<typeof useProducts>);

    const user = userEvent.setup();
    renderHomePage();

    expect(screen.getByText(/error|failed|something went wrong/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('empty state (zero published products) shows EmptyState', () => {
    vi.mocked(useProducts).mockReturnValue({
      data: { items: [], page: 1, limit: 8, total: 0 },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useProducts>);

    renderHomePage();
    expect(screen.getByText(/no products/i)).toBeInTheDocument();
  });

  it('"Browse full catalog" links to /products', () => {
    vi.mocked(useProducts).mockReturnValue({
      data: { items: makeProducts(2), page: 1, limit: 8, total: 2 },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useProducts>);

    renderHomePage();
    expect(screen.getByRole('link', { name: /browse full catalog/i })).toHaveAttribute(
      'href',
      '/products'
    );
  });
});

const products: Product[] = [
  {
    id: 'p1',
    name: 'Vanilla Candle',
    description: 'desc',
    price: 25,
    isPublished: true,
    photos: [],
    variants: [{ id: 'v1', scent: 'vanilla', size: 'large', stock: 5 }],
  },
];

function renderCatalogPage() {
  return render(
    <MemoryRouter>
      <CatalogPage />
    </MemoryRouter>
  );
}

describe.skip('CatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams(),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);
  });

  it('reads scent/size/page from URL and passes to useProducts', () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams('scent=vanilla&page=2'),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(useProducts).mockReturnValue({
      data: { items: products, page: 2, limit: 20, total: 1 },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useProducts>);

    renderCatalogPage();
    expect(useProducts).toHaveBeenCalledWith({
      scent: 'vanilla',
      size: undefined,
      page: 2,
      limit: 20,
    });
  });

  it('renders FilterBar and a ProductCard grid on success', () => {
    vi.mocked(useProducts).mockReturnValue({
      data: { items: products, page: 1, limit: 20, total: 1 },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useProducts>);

    renderCatalogPage();
    expect(screen.getByRole('navigation', { name: /filter/i })).toBeInTheDocument();
    expect(screen.getByText('Vanilla Candle')).toBeInTheDocument();
  });

  it('pagination controls computed from total/limit', () => {
    vi.mocked(useProducts).mockReturnValue({
      data: { items: products, total: 45, limit: 20, page: 1 },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useProducts>);

    renderCatalogPage();
    // Math.ceil(45/20) === 3
    expect(screen.getAllByRole('button', { name: /^[123]$/ })).toHaveLength(3);
  });

  it('loading state shows skeleton on filter/page change', () => {
    vi.mocked(useProducts).mockReturnValue({
      isLoading: true,
      isSuccess: false,
      isError: false,
      data: undefined,
    } as unknown as ReturnType<typeof useProducts>);

    renderCatalogPage();
    expect(screen.getAllByTestId(/skeleton/i).length).toBeGreaterThan(0);
  });

  it('empty state when filters match nothing includes "clear filters"', () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams('scent=obscure'),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(useProducts).mockReturnValue({
      data: { items: [], page: 1, limit: 20, total: 0 },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useProducts>);

    renderCatalogPage();
    expect(screen.getByText(/no products|no results|nothing found/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
  });

  it('error state', () => {
    vi.mocked(useProducts).mockReturnValue({
      isError: true,
      isLoading: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof useProducts>);

    renderCatalogPage();
    expect(screen.getByText(/error|failed|something went wrong/i)).toBeInTheDocument();
  });
});

// Capture onSelect from VariantSelector so tests can simulate selection

const inStockVariant: ProductVariant = {
  id: 'v1',
  scent: 'vanilla',
  size: 'large',
  stock: 5,
};

const outOfStockVariant: ProductVariant = {
  id: 'v2',
  scent: 'lavender',
  size: 'small',
  stock: 0,
};

const mockProduct: Product = {
  id: 'p1',
  name: 'Vanilla Candle',
  description: 'Warm scent',
  price: 25,
  isPublished: true,
  photos: [{ id: 'ph1', url: 'https://cdn.example.com/p1.jpg', sortOrder: 0 }],
  variants: [inStockVariant, outOfStockVariant],
};

function renderProductDetailPage() {
  return render(
    <MemoryRouter initialEntries={['/products/p1']}>
      <ProductDetailPage />
    </MemoryRouter>
  );
}

describe.skip('ProductDetailPage', () => {
  const navigate = vi.fn();
  const mutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    variantSelectorMocks.lastOnSelect = null;
    vi.mocked(useParams).mockReturnValue({ id: 'p1' });
    vi.mocked(useNavigate).mockReturnValue(navigate);
    vi.mocked(useAuthStore).mockImplementation((selector) =>
      selector({ accessToken: 'abc' } as unknown as ReturnType<typeof useAuthStore.getState>)
    );
    vi.mocked(useProduct).mockReturnValue({
      data: mockProduct,
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useProduct>);
    vi.mocked(useAddCartItem).mockReturnValue({
      mutate,
      isPending: false,
      isError: false,
      isSuccess: false,
      data: undefined,
    } as unknown as ReturnType<typeof useAddCartItem>);
  });

  it('fetches product by route id', () => {
    renderProductDetailPage();
    expect(useProduct).toHaveBeenCalledWith('p1');
  });

  it('renders PhotoGallery and VariantSelector on success', () => {
    renderProductDetailPage();
    expect(screen.getByTestId('photo-gallery')).toBeInTheDocument();
    expect(screen.getByTestId('variant-selector')).toBeInTheDocument();
  });

  it('Add to Cart disabled until a variant is selected', () => {
    renderProductDetailPage();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeDisabled();
  });

  it('Add to Cart disabled if selected variant has zero stock', () => {
    renderProductDetailPage();
    variantSelectorMocks.lastOnSelect?.(outOfStockVariant);
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeDisabled();
  });

  it('authenticated click calls useAddCartItem directly', async () => {
    const user = userEvent.setup();
    renderProductDetailPage();
    variantSelectorMocks.lastOnSelect?.(inStockVariant);

    // Set quantity to 2 if a quantity input exists
    const qty = screen.queryByLabelText(/quantity/i) ?? screen.queryByDisplayValue('1');
    if (qty) {
      await user.clear(qty);
      await user.type(qty, '2');
    }

    await user.click(screen.getByRole('button', { name: /add to cart/i }));

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        productVariantId: inStockVariant.id,
        quantity: expect.any(Number),
      })
    );
    expect(navigate).not.toHaveBeenCalled();
  });

  it('authenticated success shows a toast and stays on page', async () => {
    mutate.mockImplementation(
      (_vars: unknown, opts?: { onSuccess?: (data: { wasCapped: boolean }) => void }) => {
        opts?.onSuccess?.({ wasCapped: false });
      }
    );
    const user = userEvent.setup();
    renderProductDetailPage();
    variantSelectorMocks.lastOnSelect?.(inStockVariant);

    await user.click(screen.getByRole('button', { name: /add to cart/i }));

    await waitFor(() => {
      expect(screen.getByText(/added|success/i)).toBeInTheDocument();
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('authenticated capped response shows the capped message', async () => {
    mutate.mockImplementation(
      (
        _vars: unknown,
        opts?: {
          onSuccess?: (data: { wasCapped: boolean; cappedTo: number; message?: string }) => void;
        }
      ) => {
        opts?.onSuccess?.({
          wasCapped: true,
          cappedTo: 3,
          message: 'Only 3 left — quantity adjusted',
        });
      }
    );
    const user = userEvent.setup();
    renderProductDetailPage();
    variantSelectorMocks.lastOnSelect?.(inStockVariant);

    await user.click(screen.getByRole('button', { name: /add to cart/i }));

    await waitFor(() => {
      expect(screen.getByText(/3|capped|adjusted/i)).toBeInTheDocument();
    });
  });

  it('authenticated 409 race shows inline error, stays on page', async () => {
    const error = new AxiosError('Conflict');
    error.response = {
      status: 409,
      data: {},
      statusText: 'Conflict',
      headers: {},
      config: {} as never,
    };
    mutate.mockImplementation(
      (_vars: unknown, opts?: { onError?: (err: AxiosError) => void }) => {
        opts?.onError?.(error);
      }
    );
    const user = userEvent.setup();
    renderProductDetailPage();
    variantSelectorMocks.lastOnSelect?.(inStockVariant);

    await user.click(screen.getByRole('button', { name: /add to cart/i }));

    await waitFor(() => {
      expect(screen.getByText(/error|out of stock|unavailable|conflict/i)).toBeInTheDocument();
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('unauthenticated click redirects to login with pendingVariantId and redirect params, and does NOT call the cart endpoint', async () => {
    vi.mocked(useAuthStore).mockImplementation((selector) =>
      selector({ accessToken: null } as unknown as ReturnType<typeof useAuthStore.getState>)
    );
    const user = userEvent.setup();
    renderProductDetailPage();
    variantSelectorMocks.lastOnSelect?.(inStockVariant);

    await user.click(screen.getByRole('button', { name: /add to cart/i }));

    expect(mutate).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(
      expect.stringMatching(
        /\/login\?.*pendingVariantId=v1.*redirect=/
      )
    );
  });

  it('404/unpublished product shows an error state', () => {
    vi.mocked(useProduct).mockReturnValue({
      isError: true,
      isLoading: false,
      isSuccess: false,
      error: { response: { status: 404 } },
    } as unknown as ReturnType<typeof useProduct>);

    renderProductDetailPage();
    expect(screen.getByText(/not found|unavailable/i)).toBeInTheDocument();
  });

  it('loading state while product fetch is pending', () => {
    vi.mocked(useProduct).mockReturnValue({
      isLoading: true,
      isSuccess: false,
      isError: false,
      data: undefined,
    } as unknown as ReturnType<typeof useProduct>);

    renderProductDetailPage();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByTestId('photo-gallery')).not.toBeInTheDocument();
    expect(screen.queryByTestId('variant-selector')).not.toBeInTheDocument();
  });
});

const items: CartItem[] = [
  {
    id: 'i1',
    productVariantId: 'v1',
    productName: 'Candle A',
    scent: 'vanilla',
    size: 'large',
    unitPrice: '300.00',
    quantity: 1,
    available: true,
  },
  {
    id: 'i2',
    productVariantId: 'v2',
    productName: 'Candle B',
    scent: 'lavender',
    size: 'small',
    unitPrice: '300.00',
    quantity: 1,
    available: true,
  },
  {
    id: 'i3',
    productVariantId: 'v3',
    productName: 'Candle C',
    scent: 'rose',
    size: 'large',
    unitPrice: '300.00',
    quantity: 1,
    available: true,
  },
];

function renderCartPage() {
  return render(
    <MemoryRouter>
      <CartPage />
    </MemoryRouter>
  );
}

describe.skip('CartPage', () => {
  const navigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(navigate);
  });

  it('renders one CartItemRow per cart item', () => {
    vi.mocked(useCart).mockReturnValue({
      data: { items, total: '900.00' },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCart>);

    renderCartPage();
    expect(screen.getAllByTestId('cart-item-row')).toHaveLength(3);
  });

  it('renders CartSummary (not read-only)', () => {
    vi.mocked(useCart).mockReturnValue({
      data: { items, total: '900.00' },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCart>);

    renderCartPage();
    const summary = screen.getByTestId('cart-summary');
    expect(summary).toHaveAttribute('data-readonly', 'false');
    expect(screen.getByRole('button', { name: /proceed to checkout/i })).toBeInTheDocument();
  });

  it('empty cart shows EmptyState linking to /products', () => {
    vi.mocked(useCart).mockReturnValue({
      data: { items: [], total: '0.00' },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCart>);

    renderCartPage();
    expect(screen.queryByTestId('cart-item-row')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /catalog|products|browse/i })).toHaveAttribute(
      'href',
      '/products'
    );
  });

  it('"Proceed to Checkout" navigates to /checkout', async () => {
    vi.mocked(useCart).mockReturnValue({
      data: { items, total: '900.00' },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCart>);

    const user = userEvent.setup();
    renderCartPage();
    await user.click(screen.getByRole('button', { name: /proceed to checkout/i }));
    expect(navigate).toHaveBeenCalledWith('/checkout');
  });

  it('Proceed to Checkout disabled when cart is empty', () => {
    vi.mocked(useCart).mockReturnValue({
      data: { items: [], total: '0.00' },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCart>);

    renderCartPage();
    const btn = screen.queryByRole('button', { name: /proceed to checkout/i });
    if (btn) {
      expect(btn).toBeDisabled();
    }
    // Empty-cart branch must never allow navigating to /checkout
    expect(navigate).not.toHaveBeenCalled();
  });

  it('Proceed to Checkout disabled when all items are unavailable', () => {
    const unavailable = items.map((i) => ({ ...i, available: false }));
    vi.mocked(useCart).mockReturnValue({
      data: { items: unavailable, total: '900.00' },
      isSuccess: true,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCart>);

    renderCartPage();
    expect(screen.getByRole('button', { name: /proceed to checkout/i })).toBeDisabled();
  });

  it('loading state', () => {
    vi.mocked(useCart).mockReturnValue({
      isLoading: true,
      isSuccess: false,
      isError: false,
      data: undefined,
    } as unknown as ReturnType<typeof useCart>);

    renderCartPage();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});


import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate, useParams } from 'react-router-dom';
import ProductDetailPage from '@/pages/ProductDetailPage';
import { useProduct } from '@/hooks/useProduct';
import { useAddCartItem } from '@/hooks/useAddCartItem';
import { useAuthStore } from '@/store/auth.store';
import type { Product, ProductVariant } from '@/types';
import { AxiosError } from 'axios';

vi.mock('@/hooks/useProduct');
vi.mock('@/hooks/useAddCartItem');
vi.mock('@/store/auth.store');
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
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
  primaryPhotoUrl: 'jjj',
  photos: [{ id: 'ph1', url: 'https://cdn.example.com/p1.jpg', sortOrder: 0 }],
  variants: [inStockVariant, outOfStockVariant],
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/products/p1']}>
      <ProductDetailPage />
    </MemoryRouter>
  );
}

describe('ProductDetailPage', () => {
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
    renderPage();
    expect(useProduct).toHaveBeenCalledWith('p1');
  });

  it('renders PhotoGallery and VariantSelector on success', () => {
    renderPage();
    expect(screen.getByTestId('photo-gallery')).toBeInTheDocument();
    expect(screen.getByTestId('variant-selector')).toBeInTheDocument();
  });

  it('Add to Cart disabled until a variant is selected', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeDisabled();
  });

  it('Add to Cart disabled if selected variant has zero stock', () => {
    renderPage();
    variantSelectorMocks.lastOnSelect?.(outOfStockVariant);
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeDisabled();
  });

  it('authenticated click calls useAddCartItem directly', async () => {
    const user = userEvent.setup();
    renderPage();
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
      }),
      expect.anything()
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
    renderPage();
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
    renderPage();
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
    mutate.mockImplementation((_vars: unknown, opts?: { onError?: (err: AxiosError) => void }) => {
      opts?.onError?.(error);
    });
    const user = userEvent.setup();
    renderPage();
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
    renderPage();
    variantSelectorMocks.lastOnSelect?.(inStockVariant);

    await user.click(screen.getByRole('button', { name: /add to cart/i }));

    expect(mutate).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(
      expect.stringMatching(/\/login\?.*pendingVariantId=v1.*redirect=/)
    );
  });

  it('404/unpublished product shows an error state', () => {
    vi.mocked(useProduct).mockReturnValue({
      isError: true,
      isLoading: false,
      isSuccess: false,
      error: { response: { status: 404 } },
    } as unknown as ReturnType<typeof useProduct>);

    renderPage();
    expect(screen.getByText(/not found|unavailable/i)).toBeInTheDocument();
  });

  it('loading state while product fetch is pending', () => {
    vi.mocked(useProduct).mockReturnValue({
      isLoading: true,
      isSuccess: false,
      isError: false,
      data: undefined,
    } as unknown as ReturnType<typeof useProduct>);

    renderPage();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByTestId('photo-gallery')).not.toBeInTheDocument();
    expect(screen.queryByTestId('variant-selector')).not.toBeInTheDocument();
  });
});

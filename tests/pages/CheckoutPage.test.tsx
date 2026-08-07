// tests/pages/CheckoutPage.test.tsx
// Source: src/pages/CheckoutPage.tsx
// Per eco-9.2.3 §9.3 (CheckoutPage.test.tsx). Mocks useCart/useCheckout
// (not axios) per the guide's page-layer rule (§6.3); also mocks
// react-router's useNavigate to assert the empty-cart redirect guard.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import {
  renderWithProviders,
  screen,
  userEvent,
  mockQuerySuccess,
  mockQueryLoading,
} from '../utils/renderWithProviders';
import CheckoutPage from '@/pages/CheckoutPage';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';

vi.mock('@/hooks/useCart');
vi.mock('@/hooks/useCheckout');
const mockedUseCart = vi.mocked(useCart);
const mockedUseCheckout = vi.mocked(useCheckout);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderPage() {
  return renderWithProviders(
    <MemoryRouter>
      <CheckoutPage />
    </MemoryRouter>
  );
}

const mutateMock = vi.fn();

function mockCheckoutState(overrides: Partial<ReturnType<typeof useCheckout>> = {}) {
  mockedUseCheckout.mockReturnValue({
    mutate: mutateMock,
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
    isIdle: true,
    isPaused: false,
    status: 'idle',
    reset: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useCheckout>);
}

describe('CheckoutPage', () => {
  // Clear mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mutateMock.mockClear();
  });

  it('fetches the cart on mount', () => {
    mockedUseCart.mockReturnValue(
      mockQuerySuccess({
        items: [{ id: '1', available: true }],
        total: '45.00',
      })
    );
    mockCheckoutState();

    renderPage();

    expect(mockedUseCart).toHaveBeenCalled();
  });

  it('redirects to /cart immediately when the cart is empty, without rendering the form', () => {
    mockedUseCart.mockReturnValue(
      mockQuerySuccess({
        items: [],
        total: '0.00',
      })
    );
    mockCheckoutState();

    renderPage();

    expect(mockNavigate).toHaveBeenCalledWith('/cart');
    expect(screen.queryByLabelText(/shipping name/i)).not.toBeInTheDocument();
  });

  it('redirects to /cart when every item is unavailable, same as an empty cart', () => {
    mockedUseCart.mockReturnValue(
      mockQuerySuccess({
        items: [
          { id: '1', available: false },
          { id: '2', available: false },
        ],
        total: '0.00',
      })
    );
    mockCheckoutState();

    renderPage();

    expect(mockNavigate).toHaveBeenCalledWith('/cart');
    expect(screen.queryByLabelText(/shipping name/i)).not.toBeInTheDocument();
  });

  it('renders the shipping form when the cart has at least one available item', () => {
    mockedUseCart.mockReturnValue(
      mockQuerySuccess({
        items: [{ id: '1', available: true }],
        total: '45.00',
      })
    );
    mockCheckoutState();

    renderPage();

    expect(screen.getByLabelText(/shipping name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/shipping phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/shipping address/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders CartSummary in read-only mode (no "Proceed to Checkout" button here)', () => {
    mockedUseCart.mockReturnValue(
      mockQuerySuccess({
        items: [{ id: '1', available: true }],
        total: '45.00',
      })
    );
    mockCheckoutState();

    renderPage();

    expect(screen.queryByRole('button', { name: /proceed to checkout/i })).not.toBeInTheDocument();
  });

  it('blocks submit with empty shipping fields via client-side validation', async () => {
    mockedUseCart.mockReturnValue(
      mockQuerySuccess({
        items: [{ id: '1', available: true }],
        total: '45.00',
      })
    );
    mockCheckoutState();
    const user = userEvent.setup();

    renderPage();
    await user.click(screen.getByRole('button', { name: /pay with chapa/i }));

    expect(mutateMock).not.toHaveBeenCalled();
    expect(await screen.findAllByText(/required/i)).not.toHaveLength(0);
  });

  it('calls useCheckout with the form values on a valid submit', async () => {
    mockedUseCart.mockReturnValue(
      mockQuerySuccess({
        items: [{ id: '1', available: true }],
        total: '45.00',
      })
    );
    mockCheckoutState();
    const user = userEvent.setup();

    renderPage();
    await user.type(screen.getByLabelText(/shipping name/i), 'Ada Lovelace');
    await user.type(screen.getByLabelText(/shipping phone/i), '0911000000');
    await user.type(screen.getByLabelText(/shipping address/i), 'Addis Ababa');
    await user.click(screen.getByRole('button', { name: /pay with chapa/i }));

    expect(mutateMock).toHaveBeenCalledWith({
      shippingName: 'Ada Lovelace',
      shippingPhone: '0911000000',
      shippingAddress: 'Addis Ababa',
    });
  });

  it('renders unavailableItems inline with a link back to /cart on a 409 conflict, without retrying payment', () => {
    mockedUseCart.mockReturnValue(
      mockQuerySuccess({
        items: [{ id: '1', available: true }],
        total: '45.00',
      })
    );
    mockCheckoutState({
      isError: true,
      error: {
        response: {
          status: 409,
          data: {
            message: 'Some items in your cart are no longer available in the requested quantity',
            unavailableItems: [{ productName: 'Vanilla Candle' }],
          },
        },
      },
    } as unknown as ReturnType<typeof useCheckout>);

    renderPage();

    expect(screen.getByText(/vanilla candle/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /cart/i })).toHaveAttribute('href', '/cart');
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('sets a root-level error for other errors (e.g. 502), via a different UI path than the 409 case', () => {
    mockedUseCart.mockReturnValue(
      mockQuerySuccess({
        items: [{ id: '1', available: true }],
        total: '45.00',
      })
    );
    mockCheckoutState({
      isError: true,
      error: {
        response: {
          status: 502,
          data: { message: 'Unable to reach payment provider, please try again' },
        },
      },
    } as unknown as ReturnType<typeof useCheckout>);

    renderPage();

    expect(screen.getByText(/unable to reach payment provider/i)).toBeInTheDocument();
    expect(screen.queryByText(/no longer available/i)).not.toBeInTheDocument();
  });

  it('renders no local success UI and does not navigate/redirect itself — delegated entirely to the hook', () => {
    mockedUseCart.mockReturnValue(
      mockQuerySuccess({
        items: [{ id: '1', available: true }],
        total: '45.00',
      })
    );
    mockCheckoutState({ isSuccess: true });

    renderPage();

    expect(mockNavigate).not.toHaveBeenCalledWith(expect.stringContaining('chapa'));
    expect(screen.queryByText(/redirecting/i)).not.toBeInTheDocument();
  });

  it('shows a loading state while the cart is being fetched', () => {
    mockedUseCart.mockReturnValue(mockQueryLoading());
    mockCheckoutState();

    renderPage();

    expect(screen.getByTestId('checkout-loading')).toBeInTheDocument();
    expect(screen.queryByLabelText(/shipping name/i)).not.toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables the submit button while the checkout mutation is in flight', () => {
    mockedUseCart.mockReturnValue(
      mockQuerySuccess({
        items: [{ id: '1', available: true }],
        total: '45.00',
      })
    );
    mockCheckoutState({ isPending: true });

    renderPage();

    expect(screen.getByRole('button', { name: /pay with chapa/i })).toBeDisabled();
  });
});

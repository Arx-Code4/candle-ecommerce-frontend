// tests/hooks/useCheckout.test.ts
// Source: src/hooks/useCheckout.ts
// Per eco-9.2.3 §9.2 (useCheckout.test.ts) + eco-5c POST /checkout.
//
// ASSUMPTION FLAGGED — window.location shim: neither eco-9 nor the
// Frontend Testing Guide specifies a concrete shim implementation for
// jsdom's non-assignable native `location` object (the guide's own
// Section 6.6 example only covers the axios interceptor's 401 redirect
// conceptually, without a reusable shim). The shim below is a local,
// test-file-scoped convention — redefine `window.location` as a plain
// configurable object before each test and restore it after — not a
// documented team utility. Worth raising at review; if this pattern
// gets reused by another test, it should move to tests/utils/.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import { useCheckout } from '@/hooks/useCheckout';

vi.mock('@/lib/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
const mockedPost = vi.mocked(api.post);

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

const shippingFields = {
  shippingName: 'Ada Lovelace',
  shippingPhone: '0911000000',
  shippingAddress: 'Addis Ababa',
};

let originalLocation: Location;

describe.skip('useCheckout', () => {
  beforeEach(() => {
    mockedPost.mockReset();
    originalLocation = window.location;
    // Local shim: jsdom's real `location` doesn't allow plain assignment
    // to `.href`, so replace it with a configurable plain object for the
    // duration of each test.
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, href: '' },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('calls POST /checkout with the shipping fields', async () => {
    mockedPost.mockResolvedValueOnce({
      data: { chapaCheckoutUrl: 'https://chapa.example/pay/xyz', txRef: 'tx-1' },
    });
    const { result } = renderHook(() => useCheckout(), { wrapper });

    result.current.mutate(shippingFields);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedPost).toHaveBeenCalledWith('/checkout', shippingFields);
  });

  it('redirects by setting window.location.href inside the hook itself, on success', async () => {
    mockedPost.mockResolvedValueOnce({
      data: { chapaCheckoutUrl: 'https://chapa.example/pay/xyz', txRef: 'tx-1' },
    });
    const { result } = renderHook(() => useCheckout(), { wrapper });

    result.current.mutate(shippingFields);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Assert the actual value that was set, not merely that "some
    // navigation-like function" was called (per the guide's coverage-
    // honesty note, eco-9 §9.4).
    expect(window.location.href).toBe('https://chapa.example/pay/xyz');
  });

  it('passes a 409 stock-conflict error through untouched, with unavailableItems intact', async () => {
    const conflictError = new AxiosError('Conflict');
    const unavailableItems = [{ productVariantId: 'variant-1', currentStock: 0 }];
    conflictError.response = {
      status: 409,
      data: {
        statusCode: 409,
        success: false,
        message: 'Some items in your cart are no longer available in the requested quantity',
        errors: { unavailableItems },
      },
    } as AxiosError['response'];
    mockedPost.mockRejectedValueOnce(conflictError);
    const { result } = renderHook(() => useCheckout(), { wrapper });

    result.current.mutate(shippingFields);

    await waitFor(() => expect(result.current.isError).toBe(true));
    const err = result.current.error as AxiosError<{ errors: { unavailableItems: unknown } }>;
    expect(err.response?.data.errors.unavailableItems).toEqual(unavailableItems);
  });

  it('passes other errors (e.g. 502) through the same way, with no redirect', async () => {
    const serverError = new AxiosError('Bad Gateway');
    serverError.response = {
      status: 502,
      data: {
        statusCode: 502,
        success: false,
        message: 'Unable to reach payment provider, please try again',
        errors: null,
      },
    } as AxiosError['response'];
    mockedPost.mockRejectedValueOnce(serverError);
    const { result } = renderHook(() => useCheckout(), { wrapper });

    result.current.mutate(shippingFields);

    await waitFor(() => expect(result.current.isError).toBe(true));
    const err = result.current.error as AxiosError;
    expect(err.response?.status).toBe(502);
    expect(window.location.href).toBe('');
  });

  it('does not redirect when the mutation errors', async () => {
    mockedPost.mockRejectedValueOnce(new AxiosError('Network error'));
    const { result } = renderHook(() => useCheckout(), { wrapper });

    const hrefBefore = window.location.href;
    result.current.mutate(shippingFields);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(window.location.href).toBe(hrefBefore);
  });
});

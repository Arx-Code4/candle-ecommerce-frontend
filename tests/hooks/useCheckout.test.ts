// tests/hooks/useCheckout.test.ts
// Source: src/hooks/useCheckout.ts
// Per eco-9.2.3 §9.2 (useCheckout.test.ts) + eco-5c POST /checkout.
//
// ASSUMPTION FLAGGED — window.location shim: neither eco-9 nor the
// Frontend Testing Guide specifies a concrete shim implementation for
// jsdom's non-assignable native `location` object. The shim below is a
// local, test-file-scoped convention — redefine `window.location` as a
// plain configurable object before each test and restore it after.
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

describe('useCheckout', () => {
  beforeEach(() => {
    mockedPost.mockReset();
    originalLocation = window.location;
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
    expect(window.location.href).toBe('https://chapa.example/pay/xyz');
  });

  // CORRECTED: matches the real backend contract — checkout.service.ts
  // throws ApiError(409, message, errors) where `errors` is a flat
  // array of pre-formatted strings (e.g. "Amber Terracotta (8oz) —
  // requested: 2"), and error.middleware.ts puts that array directly
  // on response.errors with no extra nesting.
  it('passes a 409 stock-conflict error through untouched, with the errors array intact', async () => {
    const conflictError = new AxiosError('Conflict');
    const unavailableItems = ['Amber Terracotta (8oz) — requested: 2'];
    conflictError.response = {
      status: 409,
      data: {
        statusCode: 409,
        success: false,
        message: 'Some items in your cart are no longer available in the requested quantity',
        errors: unavailableItems,
      },
    } as AxiosError['response'];
    mockedPost.mockRejectedValueOnce(conflictError);
    const { result } = renderHook(() => useCheckout(), { wrapper });

    result.current.mutate(shippingFields);

    await waitFor(() => expect(result.current.isError).toBe(true));
    const err = result.current.error as AxiosError<{ errors: string[] }>;
    expect(err.response?.data.errors).toEqual(unavailableItems);
  });

  it('passes other errors (e.g. 502) through the same way, with no redirect', async () => {
    const serverError = new AxiosError('Bad Gateway');
    serverError.response = {
      status: 502,
      data: {
        statusCode: 502,
        success: false,
        message: 'Unable to reach payment provider, please try again',
        errors: [],
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

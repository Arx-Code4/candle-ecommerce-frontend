// tests/utils/renderWithProviders.tsx
// Shared render utility — per Frontend Testing Guide, Section 5.1.
// Every component/page test that needs Query context imports this
// instead of building its own QueryClientProvider inline.
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';
import { vi } from 'vitest';
import { AxiosError } from 'axios';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function AllProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Use the actual TanStack Query type
export type MockQueryResult<TData> = UseQueryResult<TData, AxiosError>;

/**
 * Professional approach: Use type assertion for test mocks
 * This is the industry-standard pattern for mocking complex library types
 */
function createBaseMock<TData>(): Omit<MockQueryResult<TData>, 'data'> {
  return {
    isLoading: false,
    isError: false,
    error: null,
    isPending: false,
    isLoadingError: false,
    isRefetchError: false,
    isSuccess: true,
    status: 'success' as const,
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isInitialLoading: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetching: false,
    isStale: false,
    isEnabled: true,
    refetch: vi.fn(),
    fetchStatus: 'idle' as const,
    promise: Promise.resolve(undefined as TData),
  };
}

/**
 * Success state mock
 */
export function mockQuerySuccess<TData>(data: TData): MockQueryResult<TData> {
  return {
    ...createBaseMock<TData>(),
    data,
    isSuccess: true,
  } as unknown as MockQueryResult<TData>;
}

/**
 * Loading state mock
 */
export function mockQueryLoading<TData>(): MockQueryResult<TData> {
  return {
    ...createBaseMock<TData>(),
    data: undefined as TData,
    isLoading: true,
    isPending: true,
    isSuccess: false,
    status: 'pending' as const,
    isFetched: false,
    isFetchedAfterMount: false,
    isFetching: true,
    isInitialLoading: true,
    fetchStatus: 'fetching' as const,
    promise: new Promise(() => {}),
  } as unknown as MockQueryResult<TData>;
}

/**
 * Error state mock
 */
export function mockQueryError<TData>(error: AxiosError | Error): MockQueryResult<TData> {
  const axiosError = error instanceof AxiosError ? error : new AxiosError(error.message);
  const promise = Promise.reject(axiosError);
  promise.catch(() => {}); // pre-catch so it never surfaces as an unhandled rejection —
  // the mock's own consumers never actually await this promise (it exists
  // only to satisfy TanStack Query's UseQueryResult shape), so nothing
  // downstream is affected by catching it here.

  return {
    ...createBaseMock<TData>(),
    data: undefined as TData,
    isLoading: false,
    isError: true,
    error: axiosError,
    isPending: false,
    isLoadingError: true,
    isRefetchError: false,
    isSuccess: false,
    status: 'error' as const,
    dataUpdatedAt: 0,
    errorUpdatedAt: Date.now(),
    failureCount: 1,
    failureReason: axiosError,
    errorUpdateCount: 1,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isInitialLoading: false,
    isRefetching: false,
    isStale: false,
    isEnabled: true,
    fetchStatus: 'idle' as const,
    promise,
  } as unknown as MockQueryResult<TData>;
}
export function mockQueryEmpty<TData>(): MockQueryResult<TData> {
  return {
    ...createBaseMock<TData>(),
    data: [] as TData,
    isSuccess: true,
  } as unknown as MockQueryResult<TData>;
}

/**
 * Refetching state mock (data with background refetch)
 */
export function mockQueryRefetching<TData>(data: TData): MockQueryResult<TData> {
  return {
    ...createBaseMock<TData>(),
    data,
    isFetching: true,
    isRefetching: true,
    isStale: true,
    fetchStatus: 'fetching' as const,
    isSuccess: true,
  } as unknown as MockQueryResult<TData>;
}

/**
 * Generic mock creator with overrides
 * This is the most flexible option
 */
export function mockQueryResult<TData>(
  data: TData,
  overrides: Partial<MockQueryResult<TData>> = {}
): MockQueryResult<TData> {
  return {
    ...createBaseMock<TData>(),
    data,
    isSuccess: true,
    ...overrides,
  } as unknown as MockQueryResult<TData>;
}

// Backward compatibility alias
export const createMockQueryResult = mockQueryResult;

// Re-export everything so every test file imports from one place
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// tests/utils/renderWithProviders.tsx
// Shared render utility — per Frontend Testing Guide, Section 5.1.
// Every component/page test that needs Query context imports this
// instead of building its own QueryClientProvider inline.
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';
import { vi } from 'vitest';

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

// Define the shape of the mock query result
export interface MockQueryResult<TData> {
  data: TData;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isPending: boolean;
  isLoadingError: boolean;
  isRefetchError: boolean;
  isSuccess: boolean;
  status: 'success' | 'error' | 'pending';
  dataUpdatedAt: number;
  errorUpdatedAt: number;
  failureCount: number;
  failureReason: Error | null;
  errorUpdateCount: number;
  isFetched: boolean;
  isFetchedAfterMount: boolean;
  isFetching: boolean;
  isInitialLoading: boolean;
  isPaused: boolean;
  isPlaceholderData: boolean;
  isRefetching: boolean;
  isStale: boolean;
  refetch: ReturnType<typeof vi.fn>;
  fetchStatus: 'idle' | 'fetching' | 'paused';
  promise: Promise<TData>;
}

// Helper to create mock query results with all required properties
export function createMockQueryResult<TData>(
  data: TData,
  overrides: Partial<Omit<MockQueryResult<TData>, 'data'>> = {}
): MockQueryResult<TData> {
  const baseResult: MockQueryResult<TData> = {
    data,
    isLoading: false,
    isError: false,
    error: null,
    isPending: false,
    isLoadingError: false,
    isRefetchError: false,
    isSuccess: true,
    status: 'success',
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
    refetch: vi.fn(),
    fetchStatus: 'idle',
    promise: Promise.resolve(data),
  };

  return { ...baseResult, ...overrides };
}

// Re-export everything so every test file imports from one place
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

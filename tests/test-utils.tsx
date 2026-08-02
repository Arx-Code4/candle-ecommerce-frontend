import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';

// Every hook test needs "a fresh QueryClientProvider per test," and every
// page test needs a router context (useNavigate/useSearchParams are used
// throughout). One shared helper avoids reimplementing this per file.
//
// Returns both the Wrapper component (for renderHook's `wrapper` option)
// AND the underlying QueryClient instance — tests that spy on
// invalidateQueries (useRegister/useLogin) need a live reference to the
// exact same client instance the hook will actually use, not a lookalike.
export function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }

  return { Wrapper, queryClient };
}

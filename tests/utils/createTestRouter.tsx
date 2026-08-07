// tests/utils/createTestRouter.tsx
// Memory-router builder for routing/guard tests — per Frontend Testing
// Guide, Section 5.2. Never import the real router from '@/routes';
// tests declare only the routes relevant to what's being tested.
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

export function renderRoutes(routes: RouteObject[], initialEntries: string[] = ['/']) {
  const router = createMemoryRouter(routes, { initialEntries });
  return render(<RouterProvider router={router} />);
}

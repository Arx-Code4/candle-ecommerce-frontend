export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCT_NEW: '/admin/products/new',
  ADMIN_PRODUCT_EDIT: '/admin/products/:id/edit', // route pattern, for router config
  ADMIN_ORDERS: '/admin/orders',
} as const;

// First dynamic route in the app — every ROUTES entry so far has been a
// static string usable directly in both router config and navigate() calls.
// A :id pattern needs the placeholder swapped for a real value before it's
// navigable, so this helper does that once instead of every call site
// hand-building the string.
export function adminProductEditPath(id: string): string {
  return ROUTES.ADMIN_PRODUCT_EDIT.replace(':id', id);
}

export const QUERY_KEYS = {
  USERS: 'users',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CART: 'cart',
  ADMIN_PRODUCTS: 'admin-products',
  ADMIN_ORDERS: 'admin-orders',
} as const;

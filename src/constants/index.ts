export const ROUTES = {
  HOME: '/',
  CATALOG: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDER_CONFIRMATION: '/order-confirmation',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',

  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Leftover from the original template scaffold — DashboardPage lists
  // ALL users, which isn't a candle-store concept. Not mounted anywhere
  // in routes/index.tsx below. Flag for the team: delete it, or repurpose
  // as an admin overview page?
  DASHBOARD: '/dashboard',

  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCT_NEW: '/admin/products/new',
  ADMIN_PRODUCT_EDIT: '/admin/products/:id/edit',
  ADMIN_ORDERS: '/admin/orders',
} as const;

export function adminProductEditPath(id: string): string {
  return ROUTES.ADMIN_PRODUCT_EDIT.replace(':id', id);
}

export function productDetailPath(id: string): string {
  return ROUTES.PRODUCT_DETAIL.replace(':id', id);
}

export function orderDetailPath(id: string): string {
  return ROUTES.ORDER_DETAIL.replace(':id', id);
}

export const QUERY_KEYS = {
  USERS: 'users',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CART: 'cart',
  ADMIN_PRODUCTS: 'admin-products',
  ADMIN_ORDERS: 'admin-orders',
} as const;

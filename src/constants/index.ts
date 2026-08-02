export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  ADMIN_PRODUCTS: '/admin/products',
} as const;

export const QUERY_KEYS = {
  USERS: 'users',
  PRODUCTS: 'products',
  CART: 'cart',
} as const;

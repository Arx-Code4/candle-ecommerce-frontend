export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
} as const;

export const QUERY_KEYS = {
  USERS: 'users',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CART: 'cart',
} as const;

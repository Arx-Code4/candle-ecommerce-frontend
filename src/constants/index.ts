export const ROUTES = {
  HOME: '/',
  CATALOG: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDER_CONFIRMATION: '/order-confirmation',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',

  ABOUT: '/about',
  CONTACT: '/contact',

  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCT_NEW: '/admin/products/new',
  ADMIN_PRODUCT_EDIT: '/admin/products/:id/edit',
  ADMIN_ORDERS: '/admin/orders',
} as const;

export function productDetailPath(id: string): string {
  return ROUTES.PRODUCT_DETAIL.replace(':id', id);
}

export function orderDetailPath(id: string): string {
  return ROUTES.ORDER_DETAIL.replace(':id', id);
}

export function adminProductEditPath(id: string): string {
  return ROUTES.ADMIN_PRODUCT_EDIT.replace(':id', id);
}

export const QUERY_KEYS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CART: 'cart',
  ADMIN_PRODUCTS: 'admin-products',
  ADMIN_ORDERS: 'admin-orders',
} as const;

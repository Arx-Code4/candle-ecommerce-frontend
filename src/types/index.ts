// API response shape matching your backend's ApiResponse class
export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

// User type
export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
  createdAt: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  pendingVariantId?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface OrderSummary {
  id: string;
  status: string;
  totalAmount: string;
  itemCount: number;
  createdAt: string;
}
// Product / catalog types
export interface ProductPhoto {
  id: string;
  url: string;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  scent: string;
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  isPublished: boolean;
  photos: ProductPhoto[];
  variants: ProductVariant[];
  primaryPhotoUrl?: string;
}

export interface ProductFilters {
  scent?: string;
  size?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

// Cart types
export interface CartItem {
  id: string;
  productVariantId: string;
  productName: string;
  scent: string;
  size: string;
  unitPrice: string;
  quantity: number;
  available: boolean;
  photoUrl?: string;
}

export interface Cart {
  items: CartItem[];
  total: string;
}

export interface AddCartItemPayload {
  productVariantId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  itemId: string;
  quantity: number;
}

export interface RemoveCartItemPayload {
  itemId: string;
}

export interface CartMutationResult {
  cartItem?: CartItem;
  cartTotal: string;
  wasCapped: boolean;
  cappedTo?: number;
  message?: string;
}

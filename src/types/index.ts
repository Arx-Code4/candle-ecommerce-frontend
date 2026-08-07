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
}

export interface ProductVariantInput {
  id?: string; // present only when updating an existing variant
  scent: string;
  size: string;
  stock: number;
}

// Describes the payload BEFORE it's packed into FormData — the backend's
// actual wire format for create/update is multipart, not JSON.
export interface ProductFormInput {
  name: string;
  description: string;
  price: number;
  variants: ProductVariantInput[];
  photos: File[]; // required on create (backend enforces min 1 photo); omitted entirely via Partial<> on update to leave existing photos untouched
}

export type OrderStatus = 'PROCESSING' | 'SHIPPED';

export interface OrderItem {
  id: string;
  variantId: string;
  quantity: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;

export interface OrderSummary {
  id: string;
  status: string;
  totalAmount: string;
  itemCount: number;
  createdAt: string;
}

import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import AdminRoute from './AdminRoute';
import ShopLayout from '@/components/layouts/ShopLayout';
import AuthLayout from '@/components/layouts/AuthLayout';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import AdminLayout from '@/components/layouts/AdminLayout';
import { ROUTES } from '@/constants';

// Shop — public, browsable by anyone, no auth required
const HomePage = lazy(() => import('@/pages/HomePage'));
const CatalogPage = lazy(() => import('@/pages/CatalogPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));

// Authenticated shopper — login required
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage'));
const OrderHistoryPage = lazy(() => import('@/pages/OrderHistoryPage'));
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'));

// Auth — only reachable when logged out
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));

// Admin — logged in AND role === 'ADMIN'
const AdminProductListPage = lazy(() => import('@/pages/admin/AdminProductListPage'));
const AdminProductFormPage = lazy(() => import('@/pages/admin/AdminProductFormPage'));
const AdminOrderListPage = lazy(() => import('@/pages/admin/AdminOrderListPage'));

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  );
}

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

const router = createBrowserRouter([
  // Public shop — no guard, no session
  {
    element: <ShopLayout />,
    children: [
      { path: ROUTES.HOME, element: withSuspense(<HomePage />) },
      { path: ROUTES.CATALOG, element: withSuspense(<CatalogPage />) },
      { path: ROUTES.PRODUCT_DETAIL, element: withSuspense(<ProductDetailPage />) },
    ],
  },

  // Authenticated shopper — cart onward requires login
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: ROUTES.CART, element: withSuspense(<CartPage />) },
          { path: ROUTES.CHECKOUT, element: withSuspense(<CheckoutPage />) },
          { path: ROUTES.ORDER_CONFIRMATION, element: withSuspense(<OrderConfirmationPage />) },
          { path: ROUTES.ORDERS, element: withSuspense(<OrderHistoryPage />) },
          { path: ROUTES.ORDER_DETAIL, element: withSuspense(<OrderDetailPage />) },
        ],
      },
    ],
  },

  // Auth
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.LOGIN, element: withSuspense(<LoginPage />) },
          { path: ROUTES.REGISTER, element: withSuspense(<RegisterPage />) },
          { path: ROUTES.FORGOT_PASSWORD, element: withSuspense(<ForgotPasswordPage />) },
          { path: ROUTES.RESET_PASSWORD, element: withSuspense(<ResetPasswordPage />) },
        ],
      },
    ],
  },

  // Admin
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: ROUTES.ADMIN_PRODUCTS, element: withSuspense(<AdminProductListPage />) },
          { path: ROUTES.ADMIN_PRODUCT_NEW, element: withSuspense(<AdminProductFormPage />) },
          { path: ROUTES.ADMIN_PRODUCT_EDIT, element: withSuspense(<AdminProductFormPage />) },
          { path: ROUTES.ADMIN_ORDERS, element: withSuspense(<AdminOrderListPage />) },
        ],
      },
    ],
  },

  { path: '*', element: withSuspense(<NotFoundPage />) },
]);

export default router;

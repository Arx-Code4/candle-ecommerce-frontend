import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import AdminRoute from './AdminRoute';
import ShopLayout from '@/components/layouts/ShopLayout';
import AuthLayout from '@/components/layouts/AuthLayout';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import AdminLayout from '@/components/layouts/AdminLayout';
import GlobalError from '@/components/common/GlobalError';
import { ROUTES } from '@/constants';

// Shop — public, browsable by anyone, no auth required
const HomePage = lazy(() => import('@/pages/HomePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
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
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminProductListPage = lazy(() => import('@/pages/admin/AdminProductListPage'));
const AdminProductFormPage = lazy(() => import('@/pages/admin/AdminProductFormPage'));
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'));

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
    errorElement: <GlobalError />,
    children: [
      { path: ROUTES.HOME, element: withSuspense(<HomePage />) },
      { path: ROUTES.ABOUT, element: withSuspense(<AboutPage />) },
      { path: ROUTES.CONTACT, element: withSuspense(<ContactPage />) },
      { path: ROUTES.CATALOG, element: withSuspense(<CatalogPage />) },
      { path: ROUTES.PRODUCT_DETAIL, element: withSuspense(<ProductDetailPage />) },
    ],
  },

  // Authenticated shopper — cart onward requires login
  {
    element: <ProtectedRoute />,
    errorElement: <GlobalError />,
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
    errorElement: <GlobalError />,
    children: [
      {
        element: <AuthLayout maxWidth="w-full" />,
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
    errorElement: <GlobalError />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: ROUTES.ADMIN_DASHBOARD, element: withSuspense(<AdminDashboardPage />) },
          { path: ROUTES.ADMIN_PRODUCTS, element: withSuspense(<AdminProductListPage />) },
          { path: ROUTES.ADMIN_PRODUCT_NEW, element: withSuspense(<AdminProductFormPage />) },
          { path: ROUTES.ADMIN_PRODUCT_EDIT, element: withSuspense(<AdminProductFormPage />) },
          { path: ROUTES.ADMIN_ORDERS, element: withSuspense(<AdminOrdersPage />) },
        ],
      },
    ],
  },

  { path: '*', element: withSuspense(<NotFoundPage />), errorElement: <GlobalError /> },
]);

export default router;

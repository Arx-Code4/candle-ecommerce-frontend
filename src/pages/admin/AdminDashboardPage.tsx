import { useAdminOrders } from '@/hooks/useAdminOrders';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

export default function AdminDashboardPage() {
  const { data: ordersData, isLoading: isLoadingOrders } = useAdminOrders();
  const { data: productsData, isLoading: isLoadingProducts } = useAdminProducts();

  const isLoading = isLoadingOrders || isLoadingProducts;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8 max-w-5xl">
        <div className="h-10 w-48 bg-[#E3D5C8]/40 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[#E3D5C8]/30 rounded-[16px]" />
          ))}
        </div>
      </div>
    );
  }

  const orders = ordersData?.items ?? [];
  const products = productsData?.items ?? [];

  // Compute some mock stats based on real data
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'PROCESSING').length;

  // Calculate revenue (only from shipped orders to be realistic)
  const revenue = orders
    .filter((o) => o.status === 'SHIPPED' || o.status === 'PROCESSING')
    .reduce((acc, order) => acc + parseFloat(order.totalAmount), 0);

  const activeProducts = products.length;

  return (
    <div className="max-w-5xl space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-[32px] md:text-[40px] text-[var(--lumiere-ink)] leading-tight">
          Welcome back.
        </h1>
        <p className="text-[14px] text-[#756D65]">Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue */}
        <div className="bg-[#FCF8F3] rounded-[16px] p-6 border border-[#E3D5C8]/50 shadow-[0_4px_20px_rgba(58,36,24,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[12px] font-semibold text-[#756D65] uppercase tracking-wider">
              Total Revenue
            </h3>
            <div className="w-8 h-8 rounded-full bg-[#E3D5C8]/30 flex items-center justify-center text-[#944A27]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
          <div>
            <p className="font-heading text-[32px] text-[var(--lumiere-ink)] leading-none mb-1">
              <span className="text-[16px] text-[#756D65] mr-1">ETB</span>
              {revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-[#756D65]">Lifetime sales volume</p>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-[#FCF8F3] rounded-[16px] p-6 border border-[#E3D5C8]/50 shadow-[0_4px_20px_rgba(58,36,24,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[12px] font-semibold text-[#756D65] uppercase tracking-wider">
              Orders
            </h3>
            <div className="w-8 h-8 rounded-full bg-[#E3D5C8]/30 flex items-center justify-center text-[#944A27]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
          </div>
          <div>
            <p className="font-heading text-[32px] text-[var(--lumiere-ink)] leading-none mb-1">
              {totalOrders}
            </p>
            <p className="text-[11px] text-[#756D65]">
              <span className="font-semibold text-[#944A27]">{pendingOrders}</span> pending
              fulfillment
            </p>
          </div>
        </div>

        {/* Products */}
        <div className="bg-[#FCF8F3] rounded-[16px] p-6 border border-[#E3D5C8]/50 shadow-[0_4px_20px_rgba(58,36,24,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[12px] font-semibold text-[#756D65] uppercase tracking-wider">
              Products
            </h3>
            <div className="w-8 h-8 rounded-full bg-[#E3D5C8]/30 flex items-center justify-center text-[#944A27]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
            </div>
          </div>
          <div>
            <p className="font-heading text-[32px] text-[var(--lumiere-ink)] leading-none mb-1">
              {activeProducts}
            </p>
            <p className="text-[11px] text-[#756D65]">Active products in catalog</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Link
          to={ROUTES.ADMIN_ORDERS}
          className="group relative overflow-hidden rounded-[16px] bg-[#944A27] text-white p-8 hover:brightness-110 transition-all shadow-md"
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h3 className="font-heading text-[24px] mb-2">Fulfill Orders</h3>
            <p className="text-[13px] text-white/80 max-w-[200px] mb-6">
              Review new purchases and manage shipping statuses.
            </p>
            <div className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider">
              View Orders
              <svg
                className="transition-transform group-hover:translate-x-1"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>
          {/* Abstract decoration */}
          <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
            <svg
              width="160"
              height="160"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
          </div>
        </Link>

        <Link
          to={ROUTES.ADMIN_PRODUCTS}
          className="group relative overflow-hidden rounded-[16px] bg-[#2A2624] text-white p-8 hover:bg-[#34302C] transition-all shadow-md"
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h3 className="font-heading text-[24px] mb-2">Manage Catalog</h3>
            <p className="text-[13px] text-white/80 max-w-[200px] mb-6">
              Add new candle scents, update stock, and edit product details.
            </p>
            <div className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider">
              View Products
              <svg
                className="transition-transform group-hover:translate-x-1"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>
          {/* Abstract decoration */}
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <svg
              width="140"
              height="140"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
}

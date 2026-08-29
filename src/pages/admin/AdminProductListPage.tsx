import { Link } from 'react-router-dom';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import AdminProductRow from '@/components/common/AdminProductRow';
import EmptyState from '@/components/common/EmptyState';
import { ROUTES } from '@/constants';

export default function AdminProductListPage() {
  const { data, isLoading, isError } = useAdminProducts();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading products…</p>;
  }

  if (isError) {
    return <p className="text-sm text-destructive">Failed to load products.</p>;
  }

  const products = data?.items ?? [];

  return (
    <div className="max-w-5xl space-y-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-[32px] md:text-[40px] text-[var(--lumiere-ink)] leading-tight">
            Products
          </h1>
          <p className="text-[14px] text-[#756D65]">Manage your catalog and stock.</p>
        </div>
        <Link
          to={ROUTES.ADMIN_PRODUCT_NEW}
          className="inline-flex h-10 items-center rounded-[10px] bg-[#944A27] px-6 text-[12px] font-semibold uppercase tracking-wider text-white hover:brightness-110 shadow-sm transition-all"
        >
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState
          message="No products yet."
          ctaLabel="Add your first product"
          ctaHref={ROUTES.ADMIN_PRODUCT_NEW}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((product) => (
            <AdminProductRow key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-2xl text-foreground">Products</h2>
        <Link
          to={ROUTES.ADMIN_PRODUCT_NEW}
          className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
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

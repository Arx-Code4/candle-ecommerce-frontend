// src/pages/HomePage.tsx
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/common/ProductCard';
import EmptyState from '@/components/common/EmptyState';
import { ROUTES } from '@/constants';

export default function HomePage() {
  const { data, isLoading, isError, isSuccess, refetch } = useProducts({ limit: 8 });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl p-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            data-testid={`skeleton-${i}`}
            className="aspect-square animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-5xl p-6 text-center">
        <p className="mb-3 text-sm text-destructive">Something went wrong loading products.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isSuccess && data.items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <EmptyState message="No products available yet." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl text-foreground">Featured Candles</h1>
        <Link to={ROUTES.CATALOG} className="text-sm text-primary underline">
          Browse full catalog
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {data?.items.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            primaryPhotoUrl={product.primaryPhotoUrl ?? undefined}
            variants={product.variants}
          />
        ))}
      </div>
    </div>
  );
}

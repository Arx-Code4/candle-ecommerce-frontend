// src/pages/CatalogPage.tsx
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/common/ProductCard';
import FilterBar from '@/components/common/FilterBar';

const LIMIT = 20;

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const scent = searchParams.get('scent') ?? undefined;
  const size = searchParams.get('size') ?? undefined;
  const page = Number(searchParams.get('page') ?? '1');

  const { data, isLoading, isError, isSuccess } = useProducts({ scent, size, page, limit: LIMIT });

  const clearFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('scent');
    next.delete('size');
    setSearchParams(next);
  };

  const goToPage = (targetPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(targetPage));
    setSearchParams(next);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl p-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
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
      <div className="mx-auto max-w-5xl p-6 text-center text-sm text-destructive">
        Something went wrong loading products.
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <nav aria-label="Filter products" className="mb-6">
        <FilterBar />
      </nav>

      {isSuccess && data.items.length === 0 ? (
        <div className="text-center">
          <p className="mb-3 text-sm text-muted-foreground">No products match those filters.</p>
          <button type="button" onClick={clearFilters} className="text-sm text-primary underline">
            Clear filters
          </button>
        </div>
      ) : (
        <>
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

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-current={p === page}
                  onClick={() => goToPage(p)}
                  className={`h-8 w-8 rounded-md text-sm ${
                    p === page ? 'bg-primary text-primary-foreground' : 'border border-input'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';
import ProductCard from '@/components/common/ProductCard';
import EmptyState from '@/components/common/EmptyState';
import type { Product } from '@/types';

interface FeaturedCandlesSectionProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function FeaturedCandlesSection({
  products,
  isLoading,
  isError,
  onRetry,
}: FeaturedCandlesSectionProps) {
  return (
    <section className="w-full bg-[var(--lumiere-ivory)] pt-20 pb-10 px-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] tracking-[0.18em] text-[#8B5A3F] uppercase font-semibold mb-3">
              OUR BESTSELLERS
            </span>
            <h2 className="font-heading text-[42px] leading-none text-[var(--lumiere-ink)] mb-2">
              Featured Candles
            </h2>
            <p className="text-[14px] text-[#5E5751]">
              Handpicked favorites loved by our customers.
            </p>
          </div>
          <Link
            to={ROUTES.CATALOG}
            className="text-[11.5px] font-medium text-[var(--lumiere-ink)] hover:text-primary transition-colors flex items-center gap-1.5 pb-1"
          >
            View all products
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                data-testid={`skeleton-${i}`}
                className="aspect-square animate-pulse rounded-[12px] bg-black/5"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-10">
            <p className="mb-3 text-sm text-red-500">Something went wrong loading products.</p>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <EmptyState message="No products available yet." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.slice(0, 5).map((product) => (
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
        )}

        {/* Carousel Indicators */}
        {!isLoading && !isError && products.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <div className="size-[7px] rounded-full bg-primary"></div>
            <div className="size-[7px] rounded-full bg-[#DCCFC4]"></div>
            <div className="size-[7px] rounded-full bg-[#DCCFC4]"></div>
            <div className="size-[7px] rounded-full bg-[#DCCFC4]"></div>
            <div className="size-[7px] rounded-full bg-[#DCCFC4]"></div>
          </div>
        )}
      </div>
    </section>
  );
}

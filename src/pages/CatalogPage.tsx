import { useSearchParams } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/common/ProductCard';
import { NewsletterSection } from '@/components/home/NewsletterSection';

const LIMIT = 12;

const SCENT_OPTIONS = ['vanilla', 'lavender', 'rose']; // Must match DB variants exactly for the mock to work
const SIZE_OPTIONS = ['small', 'large'];

const LeafIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary"
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 1 8.3C19.2 15.66 15.14 20 11 20z" />
    <path d="M11 20c2-5 3.5-7.5 8-10" />
  </svg>
);

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const scent = searchParams.get('scent') ?? undefined;
  const size = searchParams.get('size') ?? undefined;
  const page = Number(searchParams.get('page') ?? '1');

  const { data, isLoading, isError, isSuccess } = useProducts({ scent, size, page, limit: LIMIT });

  const applyFilter = (key: 'scent' | 'size', value: string) => {
    const next = new URLSearchParams(searchParams);
    const isActive = next.get(key) === value;
    if (isActive) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

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

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <div className="w-full min-h-screen bg-[var(--lumiere-ivory)] overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative w-full pt-0 pb-16 md:pt-2 md:pb-16 px-6 md:px-12 lg:px-16 flex items-center min-h-[400px]">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="w-full md:w-[45%] flex flex-col">
            <h1 className="font-heading text-[48px] md:text-[64px] leading-[1.05] text-[var(--lumiere-ink)] mb-6 tracking-tight">
              Our Collection
            </h1>
            <div className="flex items-center text-primary mb-6">
              <LeafIcon />
              <div className="h-[1px] w-8 bg-[#E3D5C8] ml-2"></div>
            </div>
            <p className="text-[13px] leading-[1.65] text-[#4B4540] max-w-[320px] font-medium">
              Hand-poured. Small-batch. Made with love.
              <br />
              Explore our signature scents crafted to
              <br />
              elevate your everyday moments.
            </p>
          </div>
          <div className="w-full md:w-[55%] flex justify-end">
            <img
              src="/images/catalog-hero.webp"
              alt="Lumiere Collection"
              className="w-full max-w-[600px] rounded-[16px] object-cover shadow-[0_10px_35px_rgba(58,36,24,0.06)]"
            />
          </div>
        </div>
      </section>

      {/* 2. Main Layout (Sidebar + Grid) */}
      <section className="w-full pb-16 px-6 md:px-12 lg:px-16">
        <div className="container mx-auto flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="w-full lg:w-[260px] shrink-0">
            <div className="bg-[#FCF8F3] rounded-[16px] p-6 shadow-[0_4px_15px_rgba(58,36,24,0.02)] border border-[rgba(232,210,193,0.4)] flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-[22px] text-[var(--lumiere-ink)]">Filter by</h3>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <line x1="21" y1="4" x2="14" y2="4" />
                  <line x1="10" y1="4" x2="3" y2="4" />
                  <line x1="21" y1="12" x2="12" y2="12" />
                  <line x1="8" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="20" x2="16" y2="20" />
                  <line x1="12" y1="20" x2="3" y2="20" />
                  <line x1="14" y1="1" x2="14" y2="7" />
                  <line x1="8" y1="9" x2="8" y2="15" />
                  <line x1="16" y1="17" x2="16" y2="23" />
                </svg>
              </div>

              {/* Scent Family */}
              <div className="flex flex-col gap-4">
                <h4 className="text-[11px] font-semibold text-[#211E1B] uppercase tracking-wider flex items-center gap-1.5">
                  SCENT FAMILY <LeafIcon />
                </h4>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      className={`size-4 rounded-full border flex items-center justify-center transition-colors ${!scent ? 'border-primary' : 'border-[#D9D1C7]'}`}
                    >
                      {!scent && <div className="size-2 rounded-full bg-primary" />}
                    </div>
                    <span
                      className={`text-[13px] ${!scent ? 'text-[var(--lumiere-ink)] font-semibold' : 'text-[#756D65] group-hover:text-[var(--lumiere-ink)]'}`}
                    >
                      All Scents
                    </span>
                    <input
                      type="radio"
                      name="scent"
                      className="hidden"
                      checked={!scent}
                      onChange={() => clearFilters()}
                    />
                  </label>
                  {SCENT_OPTIONS.map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className={`size-4 rounded-full border flex items-center justify-center transition-colors ${scent === opt ? 'border-primary' : 'border-[#D9D1C7]'}`}
                      >
                        {scent === opt && <div className="size-2 rounded-full bg-primary" />}
                      </div>
                      <span
                        className={`text-[13px] capitalize ${scent === opt ? 'text-[var(--lumiere-ink)] font-semibold' : 'text-[#756D65] group-hover:text-[var(--lumiere-ink)]'}`}
                      >
                        {opt}
                      </span>
                      <input
                        type="radio"
                        name="scent"
                        className="hidden"
                        checked={scent === opt}
                        onChange={() => applyFilter('scent', opt)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="flex flex-col gap-4">
                <h4 className="text-[11px] font-semibold text-[#211E1B] uppercase tracking-wider flex items-center gap-1.5">
                  SIZE
                </h4>
                <div className="flex flex-col gap-3">
                  {SIZE_OPTIONS.map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className={`size-4 rounded-[4px] border flex items-center justify-center transition-colors ${size === opt ? 'border-primary bg-primary' : 'border-[#D9D1C7]'}`}
                      >
                        {size === opt && (
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`text-[13px] capitalize ${size === opt ? 'text-[var(--lumiere-ink)] font-semibold' : 'text-[#756D65] group-hover:text-[var(--lumiere-ink)]'}`}
                      >
                        {opt}
                      </span>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={size === opt}
                        onChange={() => applyFilter('size', opt)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Price (Visual only) */}
              <div className="flex flex-col gap-4 mt-2">
                <h4 className="text-[11px] font-semibold text-[#211E1B] uppercase tracking-wider flex items-center gap-1.5">
                  PRICE
                </h4>
                <div className="flex flex-col gap-4 mt-2">
                  <div className="relative w-full h-1 bg-[#E3D5C8] rounded-full">
                    <div className="absolute top-0 left-0 h-full bg-primary rounded-full w-full"></div>
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 size-3 bg-primary rounded-full shadow-sm"></div>
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 size-3 bg-primary rounded-full shadow-sm"></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--lumiere-ink)]">
                    <span>ETB 0</span>
                    <span>ETB 1,000+</span>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="mt-2 w-full h-[42px] rounded-[8px] border border-[#E3D5C8] text-[#756D65] text-[12px] font-semibold flex items-center justify-center gap-2 hover:bg-white transition-colors"
              >
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
                  <path d="M3 3h18v18H3zM15 9l-6 6M9 9l6 6" />
                </svg>
                Clear Filters
              </button>
            </div>
          </aside>

          {/* Grid Area */}
          <div className="flex-1 flex flex-col">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <span className="text-[12px] text-[#756D65] font-medium">
                {isSuccess ? `Showing ${data.items.length} of ${data.total} candles` : 'Loading...'}
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 border border-[#E3D5C8] rounded-full px-4 py-1.5 bg-white">
                  <span className="text-[11px] text-[#756D65] font-medium">Sort by: Featured</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#756D65]"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                <div className="hidden sm:flex items-center gap-1 border border-[#E3D5C8] rounded-[8px] bg-white p-1">
                  <button className="size-7 rounded-[6px] bg-[#FCF8F3] text-[var(--lumiere-ink)] flex items-center justify-center">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </button>
                  <button className="size-7 rounded-[6px] text-[#A89F95] hover:text-[var(--lumiere-ink)] flex items-center justify-center transition-colors">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    data-testid="skeleton"
                    className="aspect-[4/5] animate-pulse rounded-[16px] bg-white shadow-sm border border-[rgba(232,210,193,0.3)]"
                  />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-20 text-[14px] text-destructive">
                Something went wrong loading products.
              </div>
            ) : isSuccess && data.items.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center">
                <p className="mb-4 text-[14px] text-[#756D65]">No products match those filters.</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[13px] font-semibold text-primary underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  <div className="mt-12 flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        aria-current={p === page}
                        onClick={() => goToPage(p)}
                        className={`h-9 w-9 rounded-[8px] text-[13px] font-medium transition-colors ${
                          p === page
                            ? 'bg-primary text-white shadow-sm'
                            : 'border border-[#E3D5C8] text-[#756D65] hover:bg-white'
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
        </div>
      </section>

      {/* 3. Value Strip */}
      <section className="w-full pb-20 px-6 md:px-12 lg:px-16">
        <div className="container mx-auto">
          <div className="w-full bg-[#F3E9DE] rounded-[16px] px-8 py-8 flex flex-wrap items-center justify-center lg:justify-between gap-8 md:gap-4">
            <div className="flex items-center gap-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                className="text-primary"
              >
                <path d="M12 2C12 2 8 6.5 8 11C8 13.5 10 16 12 16C14 16 16 13.5 16 11C16 6.5 12 2 12 2Z" />
                <path d="M6 14v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" />
              </svg>
              <span className="text-[12px] font-semibold text-[var(--lumiere-ink)] leading-tight">
                Hand-poured
                <br />
                with love
              </span>
            </div>

            <div className="flex items-center gap-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                className="text-primary"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                <path d="M2 12h20" />
              </svg>
              <span className="text-[12px] font-semibold text-[var(--lumiere-ink)] leading-tight">
                Small-batch
                <br />
                made
              </span>
            </div>

            <div className="flex items-center gap-4">
              <LeafIcon />
              <span className="text-[12px] font-semibold text-[var(--lumiere-ink)] leading-tight">
                Natural soy wax
                <br />& clean ingredients
              </span>
            </div>

            <div className="flex items-center gap-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                className="text-primary"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-[12px] font-semibold text-[var(--lumiere-ink)] leading-tight">
                Long-lasting
                <br />
                40–60 hours
              </span>
            </div>

            <div className="flex items-center gap-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                className="text-primary"
              >
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              <span className="text-[12px] font-semibold text-[var(--lumiere-ink)] leading-tight">
                Cruelty-free
                <br />& eco-conscious
              </span>
            </div>
          </div>
        </div>
      </section>

      <NewsletterSection />
    </div>
  );
}

export function FeaturesBanner() {
  return (
    <section className="w-full bg-[var(--lumiere-ivory-2)] py-[22px] px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
          {/* Item 1 */}
          <div className="flex items-center gap-4">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="text-primary"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <div>
              <h3 className="text-[12.5px] font-semibold text-[var(--lumiere-ink)] leading-tight mb-[2px]">
                Premium Ingredients
              </h3>
              <p className="text-[10.5px] text-[var(--lumiere-muted)] leading-tight">
                Safe, non-toxic & eco-conscious
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-center gap-4">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="text-primary"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div>
              <h3 className="text-[12.5px] font-semibold text-[var(--lumiere-ink)] leading-tight mb-[2px]">
                Long Lasting
              </h3>
              <p className="text-[10.5px] text-[var(--lumiere-muted)] leading-tight">
                40 - 60 hours of burn time
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-center gap-4">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="text-primary"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="8" width="18" height="12" rx="2" ry="2" />
              <path d="M12 8v12" />
              <path d="M16 8V6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v2" />
            </svg>
            <div>
              <h3 className="text-[12.5px] font-semibold text-[var(--lumiere-ink)] leading-tight mb-[2px]">
                Beautifully Packaged
              </h3>
              <p className="text-[10.5px] text-[var(--lumiere-muted)] leading-tight">
                Perfect for gifting
              </p>
            </div>
          </div>

          {/* Item 4 */}
          <div className="flex items-center gap-4">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="text-primary"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <div>
              <h3 className="text-[12.5px] font-semibold text-[var(--lumiere-ink)] leading-tight mb-[2px]">
                Sustainable
              </h3>
              <p className="text-[10.5px] text-[var(--lumiere-muted)] leading-tight">
                Reusable jars & earth friendly
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

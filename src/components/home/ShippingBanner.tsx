export function ShippingBanner() {
  return (
    <section className="w-full bg-[#F1E9DE] pt-10 pb-[60px] px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x divide-transparent md:divide-[#E3D5C8]">
          {/* Item 1 */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#B96B3C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <div>
              <h3 className="text-[12.5px] font-semibold text-[#211E1B] leading-tight mb-1">
                Small-batch
              </h3>
              <p className="text-[10.5px] text-[#756D65] leading-tight">Made in Ethiopia</p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#B96B3C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <div>
              <h3 className="text-[12.5px] font-semibold text-[#211E1B] leading-tight mb-1">
                Secure payments
              </h3>
              <p className="text-[10.5px] text-[#756D65] leading-tight">100% safe & secure</p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#B96B3C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
              <path d="M20 8l-6 6-4-4-6 6" />
            </svg>
            <div>
              <h3 className="text-[12.5px] font-semibold text-[#211E1B] leading-tight mb-1">
                Fast delivery
              </h3>
              <p className="text-[10.5px] text-[#756D65] leading-tight">Across Ethiopia</p>
            </div>
          </div>

          {/* Item 4 */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#B96B3C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <div>
              <h3 className="text-[12.5px] font-semibold text-[#211E1B] leading-tight mb-1">
                Easy returns
              </h3>
              <p className="text-[10.5px] text-[#756D65] leading-tight">Hassle-free returns</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

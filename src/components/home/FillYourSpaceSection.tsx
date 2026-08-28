import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

export function FillYourSpaceSection() {
  return (
    <section className="w-full bg-[var(--lumiere-ivory)] pt-0 pb-10 px-6">
      <div className="container mx-auto">
        <div className="w-full rounded-[20px] overflow-hidden shadow-[0_10px_35px_rgba(58,36,24,0.04)] relative flex flex-col lg:flex-row min-h-[400px]">
          {/* Background Image spans the entire card */}
          <img
            src="/images/discovery-candle.webp"
            alt="Luxury candle on wooden tray"
            className="absolute inset-0 w-full h-full object-cover object-center lg:object-left"
          />

          {/* Left Spacer (so text stays on the right on large screens) */}
          <div className="hidden lg:block w-[48%] relative z-10"></div>

          {/* Text Side (Right) */}
          <div className="w-full lg:w-[52%] p-8 lg:p-12 xl:p-16 flex flex-col justify-center relative z-10">
            <span className="text-[10px] tracking-[0.18em] text-[#8B5A3F] uppercase font-semibold mb-4">
              FILL YOUR SPACE
            </span>

            <h2 className="font-heading text-[38px] md:text-[44px] leading-[1.05] text-[#211E1B] mb-5">
              Scents that feel
              <br />
              like home.
            </h2>

            <p className="text-[14px] leading-[1.65] text-[#4B4540] mb-10 max-w-[420px]">
              From relaxing florals to refreshing citrus and deep woody notes, our fragrances are
              designed to create moments that matter.
            </p>

            {/* Scent Categories Row */}
            <div className="flex flex-wrap items-center gap-8 mb-10">
              <div className="flex flex-col items-center gap-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-primary"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2c-3.31 0-6 2.69-6 6 0 1.62.65 3.09 1.71 4.15l4.29 4.29 4.29-4.29A5.96 5.96 0 0 0 18 8c0-3.31-2.69-6-6-6z" />
                  <circle cx="12" cy="8" r="2" />
                </svg>
                <span className="text-[11px] font-semibold text-[#211E1B]">Floral</span>
              </div>

              <div className="h-6 border-l border-[rgba(185,107,60,0.2)]"></div>

              <div className="flex flex-col items-center gap-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-primary"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
                </svg>
                <span className="text-[11px] font-semibold text-[#211E1B]">Citrus</span>
              </div>

              <div className="h-6 border-l border-[rgba(185,107,60,0.2)]"></div>

              <div className="flex flex-col items-center gap-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-primary"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 1 8.3C19.2 15.66 15.14 20 11 20z" />
                  <path d="M11 20c2-5 3.5-7.5 8-10" />
                </svg>
                <span className="text-[11px] font-semibold text-[#211E1B]">Woody</span>
              </div>

              <div className="h-6 border-l border-[rgba(185,107,60,0.2)]"></div>

              <div className="flex flex-col items-center gap-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-primary"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 2c-1.1 2-2 3.5-2 6 0 3.3 2.7 6 6 6s6-2.7 6-6c0-2.5-.9-4-2-6" />
                  <path d="M12 2c-1.1 2-2 3.5-2 6 0 1.1.9 2 2 2s2-.9 2-2c0-2.5-.9-4-2-6" />
                  <path d="M6 14c-2.2 1.6-3 4.2-3 7h18c0-2.8-.8-5.4-3-7" />
                </svg>
                <span className="text-[11px] font-semibold text-[#211E1B]">Warm & Cozy</span>
              </div>
            </div>

            {/* CTA Button */}
            <div>
              <Link
                to={ROUTES.CATALOG}
                className="inline-flex shrink-0 items-center justify-center rounded-[10px] bg-[#211E1B] text-white px-[22px] py-[13px] text-[12px] font-semibold tracking-wide hover:-translate-y-[1px] hover:brightness-[1.1] transition-all duration-[180ms] shadow-sm gap-3"
              >
                Explore Collections
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

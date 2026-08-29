import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

export function HeroSection() {
  return (
    <section
      className="relative w-full min-h-[700px] flex items-center text-white bg-cover bg-center"
      style={{
        backgroundImage: `
          linear-gradient(
            90deg,
            rgba(8, 6, 4, 0.97) 0%,
            rgba(8, 6, 4, 0.91) 23%,
            rgba(8, 6, 4, 0.72) 43%,
            rgba(8, 6, 4, 0.28) 68%,
            rgba(8, 6, 4, 0.18) 100%
          ),
          url('/images/hero-candle.webp')
        `,
        backgroundPosition: '65% center',
      }}
    >
      <div className="container relative z-10 pt-[80px]">
        {/* Headline */}
        <h1
          className="font-heading font-medium tracking-[-0.035em] mb-4"
          style={{ fontSize: 'clamp(48px, 5vw, 70px)', lineHeight: 0.92 }}
        >
          <span className="block text-[#F8F3ED]">Warmth you can</span>
          <span className="block text-[#F8F3ED]">carry from</span>
          <span className="block text-[#C57A4B]">room to room.</span>
        </h1>

        {/* Decorative Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-12 bg-primary"></div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-primary">
            <path
              d="M12 2C12 2 7 8 7 13C7 16 9 19 12 19C15 19 17 16 17 13C17 8 12 2 12 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="h-px w-12 bg-primary"></div>
        </div>

        {/* Body Copy */}
        <p className="max-w-[410px] text-[13px] leading-[1.65] text-[rgba(248,243,237,0.92)] mb-10">
          Small-batch soy wax candles and home fragrances, hand-poured with love in Addis Ababa.
          Elevate your space with our curated collections of woody, floral, and citrus scents.
        </p>

        {/* CTA */}
        <Link
          to={ROUTES.CATALOG}
          className="inline-flex shrink-0 items-center justify-center rounded-[10px] bg-primary text-white px-[24px] py-[13px] text-[12px] font-semibold tracking-wide hover:-translate-y-[1px] hover:brightness-[1.04] transition-all duration-[180ms] shadow-sm gap-3"
        >
          Shop the Collection
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

        {/* Value Features Strip */}
        <div className="mt-[100px] flex flex-wrap items-center gap-6 md:gap-10">
          {/* Feature 1 */}
          <div className="flex items-center gap-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
              {/* Candle/Heart concept */}
              <path
                d="M12 2C12 2 8 6.5 8 11C8 13.5 10 16 12 16C14 16 16 13.5 16 11C16 6.5 12 2 12 2Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 14v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-[11px] leading-tight text-[#F8F3ED]">
              Hand-poured
              <br />
              with love
            </p>
          </div>

          {/* Divider */}
          <div className="hidden md:block h-8 border-l border-white/25"></div>

          {/* Feature 2 */}
          <div className="flex items-center gap-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
              {/* Leaf concept */}
              <path
                d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 1 8.3C19.2 15.66 15.14 20 11 20z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11 20c2-5 3.5-7.5 8-10"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-[11px] leading-tight text-[#F8F3ED]">
              Natural soy wax
              <br />& clean ingredients
            </p>
          </div>

          {/* Divider */}
          <div className="hidden md:block h-8 border-l border-white/25"></div>

          {/* Feature 3 */}
          <div className="flex items-center gap-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
              {/* Pin concept */}
              <path
                d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="10"
                r="3"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-[11px] leading-tight text-[#F8F3ED]">
              Made in
              <br />
              Addis Ababa
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

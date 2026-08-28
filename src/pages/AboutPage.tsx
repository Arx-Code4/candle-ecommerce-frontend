import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { NewsletterSection } from '@/components/home/NewsletterSection';

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

const HeartIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary"
  >
    <path d="M12 2C12 2 8 6.5 8 11C8 13.5 10 16 12 16C14 16 16 13.5 16 11C16 6.5 12 2 12 2Z" />
    <path d="M6 14v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" />
  </svg>
);

const CheckShieldIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const PackageIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-[var(--lumiere-ivory)] overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative w-full pt-0 pb-16 md:pt-2 md:pb-24 px-6 md:px-12 lg:px-16 flex items-center min-h-[500px]">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <LeafIcon />
              <span className="text-[10px] tracking-[0.18em] text-primary uppercase font-semibold">
                OUR STORY
              </span>
            </div>
            <h1 className="font-heading text-[42px] md:text-[56px] leading-[1.05] text-[var(--lumiere-ink)] mb-6">
              Crafted with purpose.
              <br />
              Made to be <span className="text-primary">remembered.</span>
            </h1>
            <p className="text-[14px] leading-[1.65] text-[#4B4540] max-w-[400px] mb-8 font-medium">
              Lumière began with a simple belief—the right scent can transform a space, uplift a
              mood, and bring people closer.
            </p>
            <Link
              to={ROUTES.CATALOG}
              className="inline-flex shrink-0 w-max items-center justify-center rounded-[10px] bg-primary text-white px-8 py-3.5 text-[12px] font-semibold tracking-wide hover:-translate-y-px hover:brightness-105 transition-all shadow-sm gap-2"
            >
              Our Collections
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
          <div className="w-full md:w-1/2 flex justify-end">
            <img
              src="/images/about-hero.webp"
              alt="Lumiere Candle"
              className="w-full max-w-[480px] rounded-[16px] object-cover shadow-[0_10px_35px_rgba(58,36,24,0.06)]"
            />
          </div>
        </div>
      </section>

      {/* 2. The Problem */}
      <section className="w-full py-16 px-6 md:px-12 lg:px-16 bg-white">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center size-5 rounded-full border border-primary text-primary text-[8px] font-bold">
                L
              </span>
              <span className="text-[10px] tracking-[0.18em] text-[var(--lumiere-ink-soft)] uppercase font-semibold">
                THE PROBLEM
              </span>
            </div>
            <h2 className="font-heading text-[36px] md:text-[42px] leading-[1.1] text-[var(--lumiere-ink)] mb-4">
              A gap in the
              <br />
              home fragrance market
            </h2>
            <div className="h-px w-12 bg-primary mb-6"></div>
            <div className="flex flex-col gap-4 text-[13px] leading-[1.65] text-[#4B4540]">
              <p>
                We noticed a significant gap in the home fragrance market. Mass-produced candles
                were overwhelmingly filled with synthetic ingredients, paraffin wax, and artificial
                scents that felt harsh rather than comforting.
              </p>
              <p>
                On the other hand, true luxury, artisanal candles were often inaccessible or
                disconnected from genuine, thoughtful craftsmanship. Finding a candle that was both
                clean-burning and authentically crafted felt impossible.
              </p>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <img
              src="/images/about-problem.webp"
              alt="Lumiere Box"
              className="w-full rounded-[16px] object-cover shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* 3. Our Solution */}
      <section className="w-full py-16 px-6 md:px-12 lg:px-16">
        <div className="container mx-auto flex flex-col-reverse md:flex-row items-center gap-12 lg:gap-20">
          <div className="w-full md:w-1/2">
            <img
              src="/images/about-solution.webp"
              alt="Lighting candles"
              className="w-full rounded-[16px] object-cover shadow-sm"
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <LeafIcon />
              <span className="text-[10px] tracking-[0.18em] text-[var(--lumiere-ink-soft)] uppercase font-semibold">
                OUR SOLUTION
              </span>
            </div>
            <h2 className="font-heading text-[36px] md:text-[42px] leading-[1.1] text-[var(--lumiere-ink)] mb-6">
              Thoughtful scents.
              <br />
              Conscious choices.
            </h2>
            <div className="flex flex-col gap-4 text-[13px] leading-[1.65] text-[#4B4540]">
              <p>
                <strong className="text-[var(--lumiere-ink)] font-semibold">Lumière</strong> was
                born in{' '}
                <strong className="text-[var(--lumiere-ink)] font-semibold">Addis Ababa</strong> to
                create a different kind of warmth. We craft{' '}
                <strong className="text-[var(--lumiere-ink)] font-semibold">small-batch</strong>,
                hand-poured candles using 100%{' '}
                <strong className="text-[var(--lumiere-ink)] font-semibold">
                  natural soy wax and clean ingredients
                </strong>
                .
              </p>
              <p>
                Our scents are meticulously curated—from{' '}
                <strong className="text-[var(--lumiere-ink)] font-semibold">
                  deep woody notes
                </strong>{' '}
                to delicate florals and bright citrus—to elevate your space naturally. We believe in
                &quot;
                <strong className="text-[var(--lumiere-ink)] font-semibold">
                  Scents That Stay
                </strong>
                ,&quot; creating{' '}
                <strong className="text-[var(--lumiere-ink)] font-semibold">
                  moments that matter
                </strong>{' '}
                through sustainable, beautifully packaged home fragrances that are as safe as they
                are luxurious.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Quality Container */}
      <section className="w-full py-10 px-6">
        <div className="container mx-auto">
          <div className="bg-[#F3E9DE] rounded-[20px] p-10 md:p-14 relative overflow-hidden flex flex-col">
            <span className="text-[10px] tracking-[0.18em] text-primary uppercase font-semibold mb-2">
              HAND-POURED WITH LOVE
            </span>
            <h2 className="font-heading text-[36px] text-[var(--lumiere-ink)] mb-10">
              Quality in every detail.
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
              <div className="flex flex-col">
                <HeartIcon />
                <h4 className="text-[13px] font-semibold text-[var(--lumiere-ink)] mt-4 mb-2">
                  Small Batch
                </h4>
                <p className="text-[11px] leading-[1.6] text-[var(--lumiere-ink-soft)] max-w-[160px]">
                  We produce in small batches to ensure exceptional quality and attention.
                </p>
              </div>
              <div className="flex flex-col">
                <LeafIcon />
                <h4 className="text-[13px] font-semibold text-[var(--lumiere-ink)] mt-4 mb-2">
                  Clean Ingredients
                </h4>
                <p className="text-[11px] leading-[1.6] text-[var(--lumiere-ink-soft)] max-w-[160px]">
                  We use natural soy wax, paraben-free fragrances, and non-toxic ingredients for a
                  safer burn.
                </p>
              </div>
              <div className="flex flex-col">
                <CheckShieldIcon />
                <h4 className="text-[13px] font-semibold text-[var(--lumiere-ink)] mt-4 mb-2">
                  Premium Quality
                </h4>
                <p className="text-[11px] leading-[1.6] text-[var(--lumiere-ink-soft)] max-w-[160px]">
                  Every wick, every drop, every scent profile meets our exacting standards.
                </p>
              </div>
              <div className="flex flex-col">
                <PackageIcon />
                <h4 className="text-[13px] font-semibold text-[var(--lumiere-ink)] mt-4 mb-2">
                  Sustainable Packaging
                </h4>
                <p className="text-[11px] leading-[1.6] text-[var(--lumiere-ink-soft)] max-w-[160px]">
                  Our packaging is eco-friendly, recyclable, and designed to be reused or
                  repurposed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Our Promise */}
      <section className="w-full py-16 px-6 md:px-12 lg:px-16 bg-white mb-20">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div className="w-full md:w-3/5 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <LeafIcon />
              <span className="text-[10px] tracking-[0.18em] text-[var(--lumiere-ink-soft)] uppercase font-semibold">
                OUR PROMISE
              </span>
            </div>
            <h2 className="font-heading text-[32px] md:text-[38px] leading-[1.1] text-[var(--lumiere-ink)] mb-10">
              More than a candle, it's an experience.
            </h2>

            <div className="flex flex-wrap gap-8">
              <div className="flex flex-col w-[120px]">
                <ClockIcon />
                <p className="text-[10px] mt-3 leading-snug font-medium text-[var(--lumiere-ink-soft)]">
                  Long-lasting
                  <br />
                  signature scents
                </p>
              </div>
              <div className="flex flex-col w-[120px]">
                <LeafIcon />
                <p className="text-[10px] mt-3 leading-snug font-medium text-[var(--lumiere-ink-soft)]">
                  Premium
                  <br />
                  ingredients, always
                </p>
              </div>
              <div className="flex flex-col w-[120px]">
                <HeartIcon />
                <p className="text-[10px] mt-3 leading-snug font-medium text-[var(--lumiere-ink-soft)]">
                  Beautifully designed
                  <br />
                  for every space
                </p>
              </div>
              <div className="flex flex-col w-[120px]">
                <PackageIcon />
                <p className="text-[10px] mt-3 leading-snug font-medium text-[var(--lumiere-ink-soft)]">
                  Thoughtful gifts that
                  <br />
                  leave an impression
                </p>
              </div>
              <div className="flex flex-col w-[120px]">
                <HeartIcon />
                <p className="text-[10px] mt-3 leading-snug font-medium text-[var(--lumiere-ink-soft)]">
                  Made to elevate
                  <br />
                  everyday moments
                </p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-2/5 flex justify-end">
            <img
              src="/images/about-promise.webp"
              alt="Lumiere Promise"
              className="w-full rounded-[16px] object-cover shadow-sm"
            />
          </div>
        </div>
      </section>

      <NewsletterSection />
    </div>
  );
}

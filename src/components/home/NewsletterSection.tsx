import { Link } from 'react-router-dom';

export function NewsletterSection() {
  return (
    <section className="w-full relative min-h-[400px] flex items-center overflow-hidden bg-[#100B08]">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/images/newsletter-bg.webp"
          alt="Lumiere candle and packaging"
          className="w-full h-full object-cover object-center"
        />
        {/* Optional gradient overlay to ensure text is readable on smaller screens where the image might shift */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#100B08]/60 to-[#100B08] md:hidden"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center w-full">
          {/* Spacer for the left side (where the candle image is) */}
          <div className="hidden lg:block w-1/2"></div>

          {/* Content on the right side */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center py-16 lg:pl-12">
            <h2 className="font-heading text-[32px] md:text-[40px] text-white leading-tight mb-3">
              Be the first to know
            </h2>

            <p className="text-[14px] text-[rgba(255,255,255,0.85)] mb-8 font-light tracking-wide">
              Get new arrivals, exclusive offers, and scent inspiration.
            </p>

            {/* CTA */}
            <div className="flex">
              <Link
                to="/#contact"
                className="inline-flex shrink-0 h-[46px] px-10 items-center justify-center rounded-[10px] bg-primary text-white text-[13px] font-semibold hover:brightness-110 transition-all shadow-sm"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

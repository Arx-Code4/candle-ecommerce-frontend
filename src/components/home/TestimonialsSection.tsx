const TESTIMONIALS = [
  {
    text: 'The quality is unmatched! You can really feel the love and care in every single candle.',
    author: 'Betelhem A.',
  },
  {
    text: 'My go-to for gifts and self-care. The scents are amazing and the burn time is incredible.',
    author: 'Samuel T.',
  },
  {
    text: "Beautiful packaging, lovely scents, and it's great supporting a local brand in Addis.",
    author: 'Hana M.',
  },
];

export function TestimonialsSection() {
  return (
    <section className="w-full bg-[var(--lumiere-ivory)] pt-0 pb-10 px-6 relative">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <span className="text-[9px] tracking-[0.18em] text-[#8B5A3F] uppercase font-semibold mb-3">
            LOVED BY OUR CUSTOMERS
          </span>

          <div className="flex items-center gap-4">
            {/* Left Divider with Leaf */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-[1px] bg-[#B96B3C]/40"></div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#B96B3C"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 1 8.3C19.2 15.66 15.14 20 11 20z" />
              </svg>
            </div>

            <h2 className="font-heading text-[38px] md:text-[42px] leading-none text-[#211E1B]">
              What they&apos;re saying
            </h2>

            {/* Right Divider Line */}
            <div className="w-16 h-[1px] bg-[#B96B3C]/40"></div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative w-full max-w-[1100px] mx-auto flex items-center gap-6">
          {/* Left Arrow */}
          <button
            aria-label="Previous testimonial"
            className="hidden lg:flex shrink-0 size-8 rounded-full bg-[#211E1B] text-white items-center justify-center hover:bg-black transition-colors -ml-4"
          >
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
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Testimonials Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, i) => (
              <div
                key={i}
                className="bg-[var(--lumiere-ivory-2)] border border-[rgba(185,107,60,0.15)] rounded-[12px] p-8 flex flex-col justify-between shadow-sm relative"
              >
                {/* Quote Icon */}
                <div className="absolute top-8 left-6 text-[#B96B3C]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.4 6c0 1.5-.6 2.6-1.7 3.5-.8.7-1.8 1-2.9 1-1.3 0-2.4-.4-3.2-1.3-.9-.9-1.3-2-1.3-3.4 0-1.8.8-3.4 2.3-4.6C4.2.1 5.9-.3 7.8-.3v2.8c-.8 0-1.5.2-1.9.5-.5.4-.8 1-.8 1.8h1.1c1 0 1.8.3 2.5 1 .7.6 1.1 1.4 1.1 2.4zm10.7 0c0 1.5-.6 2.6-1.7 3.5-.8.7-1.8 1-2.9 1-1.3 0-2.4-.4-3.2-1.3-.9-.9-1.3-2-1.3-3.4 0-1.8.8-3.4 2.3-4.6 1.6-1.1 3.3-1.5 5.2-1.5v2.8c-.8 0-1.5.2-1.9.5-.5.4-.8 1-.8 1.8h1.1c1 0 1.8.3 2.5 1 .7.6 1.1 1.4 1.1 2.4z" />
                  </svg>
                </div>

                <p className="font-heading text-[16px] italic text-[#4B4540] leading-[1.65] mb-8 mt-1 pl-6">
                  &quot;{testimonial.text}&quot;
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <span className="font-sans font-bold text-[12px] text-[#211E1B]">
                    — {testimonial.author}
                  </span>

                  {/* Copper Stars */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="#B96B3C"
                        stroke="#B96B3C"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            aria-label="Next testimonial"
            className="hidden lg:flex shrink-0 size-8 rounded-full bg-[#211E1B] text-white items-center justify-center hover:bg-black transition-colors -mr-4"
          >
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
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

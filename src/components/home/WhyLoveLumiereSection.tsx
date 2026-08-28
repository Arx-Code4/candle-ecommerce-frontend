export function WhyLoveLumiereSection() {
  return (
    <section className="w-full bg-[var(--lumiere-ivory)] pb-10 pt-0 px-6">
      <div className="container mx-auto">
        <div
          className="w-full rounded-[20px] p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-10 shadow-[0_10px_35px_rgba(58,36,24,0.04)]"
          style={{
            background: `url('/images/botanical-texture.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '140px',
          }}
        >
          {/* Heading */}
          <div className="lg:w-1/5 shrink-0">
            <h2 className="font-heading text-[32px] leading-[1.1] text-[#211E1B]">
              Why you'll
              <br />
              love Lumière
            </h2>
          </div>

          {/* Benefits Grid */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {/* Benefit 1 */}
            <div className="flex flex-col gap-3">
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <div>
                <h3 className="text-[12px] font-semibold text-[#211E1B] mb-1">Clean & Safe</h3>
                <p className="text-[11px] text-[#4B4540] leading-[1.4]">
                  No paraffin. No toxins.
                  <br />
                  Just clean-burning
                  <br />
                  happiness.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex flex-col gap-3">
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
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <rect width="18" height="18" x="3" y="8" rx="2" />
                <path d="M3 13h18" />
              </svg>
              <div>
                <h3 className="text-[12px] font-semibold text-[#211E1B] mb-1">
                  Rich, Layered Fragrance
                </h3>
                <p className="text-[11px] text-[#4B4540] leading-[1.4]">
                  Carefully crafted scents
                  <br />
                  that fill your space
                  <br />
                  beautifully.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex flex-col gap-3">
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
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <div>
                <h3 className="text-[12px] font-semibold text-[#211E1B] mb-1">Made with Care</h3>
                <p className="text-[11px] text-[#4B4540] leading-[1.4]">
                  Small batches,
                  <br />
                  hand-poured with
                  <br />
                  passion and purpose.
                </p>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="flex flex-col gap-3">
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
                <path d="M12 6v6l4 2" />
              </svg>
              <div>
                <h3 className="text-[12px] font-semibold text-[#211E1B] mb-1">For Every Moment</h3>
                <p className="text-[11px] text-[#4B4540] leading-[1.4]">
                  Relax, focus, celebrate —<br />
                  we have a scent for
                  <br />
                  every feeling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

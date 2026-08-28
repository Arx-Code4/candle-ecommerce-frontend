import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

const InstagramIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
const FacebookIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const TikTokIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);
const PinterestIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m8 20 4-9" />
    <path d="M10.7 14c.4.9 2 4.8 5.1 4.8 2.6 0 4.2-2.2 4.2-4.9 0-3.3-2.5-6.9-7-6.9-4.8 0-8 3.5-8 7.3 0 2.2 1.3 4.1 3 4.8 1.1-.9 2.1-2.9 2.1-2.9" />
  </svg>
);

export function ShopFooter() {
  return (
    <footer className="bg-[#140D0B] text-[var(--lumiere-ivory)] pt-20 pb-8 px-6 md:px-12 lg:px-[64px]">
      <div className="container mx-auto">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-[60px] mb-16">
          {/* Brand Column (Left) */}
          <div className="flex flex-col max-w-[280px]">
            <Link to={ROUTES.HOME} aria-label="Home" className="flex flex-col mb-4">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mb-1 text-primary"
              >
                <path
                  d="M12 2C12 2 7 8 7 13C7 16 9 19 12 19C15 19 17 16 17 13C17 8 12 2 12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="font-heading text-[28px] leading-none tracking-[0.11em] text-[#F8F3ED]">
                LUMIÈRE
              </div>
              <div className="mt-1 text-[7px] font-medium tracking-[0.18em] text-[#F8F3ED]">
                SCENTS THAT STAY
              </div>
            </Link>
            <p className="text-[13px] leading-[1.65] text-[rgba(248,243,237,0.7)] max-w-[210px] mb-6">
              Small-batch soy wax candles and home fragrances, hand-poured in Addis Ababa with love.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="flex size-7 items-center justify-center rounded-full border border-[rgba(248,243,237,0.4)] text-[#F8F3ED] hover:border-[#D18A61] hover:text-[#D18A61] transition-colors"
              >
                <InstagramIcon />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="flex size-7 items-center justify-center rounded-full border border-[rgba(248,243,237,0.4)] text-[#F8F3ED] hover:border-[#D18A61] hover:text-[#D18A61] transition-colors"
              >
                <FacebookIcon />
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="flex size-7 items-center justify-center rounded-full border border-[rgba(248,243,237,0.4)] text-[#F8F3ED] hover:border-[#D18A61] hover:text-[#D18A61] transition-colors"
              >
                <TikTokIcon />
              </a>
              <a
                href="#"
                aria-label="Pinterest"
                className="flex size-7 items-center justify-center rounded-full border border-[rgba(248,243,237,0.4)] text-[#F8F3ED] hover:border-[#D18A61] hover:text-[#D18A61] transition-colors"
              >
                <PinterestIcon />
              </a>
            </div>
          </div>

          {/* Right Side Group (Links + Contact) */}
          <div className="flex flex-wrap lg:flex-nowrap gap-12 lg:gap-[80px]">
            {/* Links Section */}
            <div className="flex gap-12 lg:gap-[80px]">
              <div className="flex flex-col">
                <h4 className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-6 text-[#F8F3ED]">
                  SHOP
                </h4>
                <ul className="flex flex-col gap-4 text-[11.5px] font-medium text-[rgba(248,243,237,0.76)]">
                  <li>
                    <Link to={ROUTES.CATALOG} className="hover:text-[#D18A61] transition-colors">
                      All Candles
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col">
                <h4 className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-6 text-[#F8F3ED]">
                  COMPANY
                </h4>
                <ul className="flex flex-col gap-4 text-[11.5px] font-medium text-[rgba(248,243,237,0.76)]">
                  <li>
                    <Link to={ROUTES.ABOUT} className="hover:text-[#D18A61] transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to={ROUTES.CONTACT} className="hover:text-[#D18A61] transition-colors">
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="flex flex-col max-w-[280px]">
              <h4 className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-6 text-[#F8F3ED]">
                GET IN TOUCH
              </h4>
              <p className="text-[12px] leading-[1.6] text-[rgba(248,243,237,0.76)] mb-4">
                Have questions about our candles or want to partner with us?
              </p>
              <Link
                to={ROUTES.CONTACT}
                className="inline-flex items-center justify-center rounded-[4px] bg-[rgba(248,243,237,0.1)] text-[#F8F3ED] px-6 py-2.5 text-[12px] hover:bg-[rgba(248,243,237,0.2)] transition-colors w-max border border-[rgba(248,243,237,0.2)]"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="border-t border-[rgba(248,243,237,0.15)] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[9.5px] text-[rgba(248,243,237,0.55)]">
          <p>© 2024 Lumière. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="#" className="hover:text-[#D18A61] transition-colors">
              Privacy Policy
            </Link>
            <span className="opacity-40">|</span>
            <Link to="#" className="hover:text-[#D18A61] transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

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
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 1 8.3C19.2 15.66 15.14 20 11 20z" />
    <path d="M11 20c2-5 3.5-7.5 8-10" />
  </svg>
);

const MailIcon = () => (
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
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 4 10 8 10-8" />
  </svg>
);

const PhoneIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MapPinIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const HandshakeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary"
  >
    <path d="M14.28 17.07 20 11a4.24 4.24 0 0 0-6-6l-5.63 5.63a3.5 3.5 0 0 0-.81 3.54l-5 5A3.5 3.5 0 0 0 4 23c2 0 4-1 4-1a3.5 3.5 0 0 0 3.54-.81l5-5Z" />
    <path d="M14.5 15.5 19 20M9 10l-4-4" />
  </svg>
);

const GiftIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary"
  >
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13" />
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-[#756D65]"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const ShieldLargeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-[var(--lumiere-ink-soft)]"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const HandHeartIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-[var(--lumiere-ink-soft)]"
  >
    <path d="M7 11.2V19a2 2 0 0 0 2 2h7.62a2 2 0 0 0 1.93-1.46l2.35-8A2 2 0 0 0 18.97 9h-4.32a2 2 0 0 1-1.95-1.56l-1.05-4.2A2 2 0 0 0 9.71 2h-1A2.7 2.7 0 0 0 6 4.7v6.5M10.5 13a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-[var(--lumiere-ink-soft)]"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function ContactPage() {
  return (
    <div className="w-full min-h-screen bg-[var(--lumiere-ivory)] overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative w-full pt-0 pb-16 md:pt-2 md:pb-16 px-6 md:px-12 lg:px-16 flex items-center min-h-[500px]">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="w-full md:w-[45%] flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <LeafIcon />
              <span className="text-[10px] tracking-[0.18em] uppercase font-semibold">
                GET IN TOUCH
              </span>
            </div>
            <h1 className="font-heading text-[44px] md:text-[56px] leading-[1.05] text-[var(--lumiere-ink)] mb-6">
              We'd love to
              <br />
              hear from <span className="text-primary">you.</span>
            </h1>
            <p className="text-[14px] leading-[1.65] text-[#4B4540] max-w-[360px] mb-8 font-medium">
              Have questions about our candles, your order, or wholesale partnerships? We're here to
              help. Send us a message and we'll get back to you soon.
            </p>
            <div className="flex items-center text-primary mt-2">
              <div className="h-[1px] w-8 bg-[#E3D5C8]"></div>
              <div className="mx-2">
                <LeafIcon />
              </div>
            </div>
          </div>
          <div className="w-full md:w-[55%] flex justify-end">
            <img
              src="/images/contact-hero.webp"
              alt="Lumiere Candle"
              className="w-full max-w-[500px] rounded-[16px] object-cover shadow-[0_10px_35px_rgba(58,36,24,0.06)]"
            />
          </div>
        </div>
      </section>

      {/* 2. Main Form & Contact Info */}
      <section className="w-full pb-8 px-6 md:px-12 lg:px-16">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-[1fr_400px] gap-8">
          {/* Left Form Card */}
          <div className="bg-white rounded-[20px] p-8 md:p-12 shadow-[0_10px_35px_rgba(58,36,24,0.03)] border border-[rgba(232,210,193,0.3)]">
            <div className="flex items-center gap-4 mb-2">
              <MailIcon />
              <h2 className="font-heading text-[32px] text-[var(--lumiere-ink)]">
                Send us a message
              </h2>
            </div>
            <p className="text-[13px] text-[#4B4540] mb-8">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>

            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col gap-2 w-full">
                  <label className="text-[10px] font-semibold text-[#211E1B] uppercase tracking-wider">
                    FIRST NAME
                  </label>
                  <input
                    type="text"
                    placeholder="First name"
                    className="w-full h-[48px] px-4 rounded-[8px] bg-[var(--lumiere-ivory)] border border-transparent focus:border-primary outline-none transition-colors text-[13px] placeholder:text-[#A89F95]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <label className="text-[10px] font-semibold text-[#211E1B] uppercase tracking-wider">
                    LAST NAME
                  </label>
                  <input
                    type="text"
                    placeholder="Last name"
                    className="w-full h-[48px] px-4 rounded-[8px] bg-[var(--lumiere-ivory)] border border-transparent focus:border-primary outline-none transition-colors text-[13px] placeholder:text-[#A89F95]"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-[#211E1B] uppercase tracking-wider">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full h-[48px] px-4 rounded-[8px] bg-[var(--lumiere-ivory)] border border-transparent focus:border-primary outline-none transition-colors text-[13px] placeholder:text-[#A89F95]"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-[#211E1B] uppercase tracking-wider">
                  MESSAGE
                </label>
                <textarea
                  rows={5}
                  placeholder="How can we help you?"
                  className="w-full p-4 rounded-[8px] bg-[var(--lumiere-ivory)] border border-transparent focus:border-primary outline-none transition-colors resize-none text-[13px] placeholder:text-[#A89F95]"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="mt-2 flex items-center justify-center gap-2 w-full h-[52px] rounded-[10px] bg-[#944A27] text-white text-[13px] font-semibold hover:brightness-110 transition-all shadow-sm tracking-wide"
              >
                Send Message
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
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <div className="flex items-center justify-center gap-2 mt-2">
                <ShieldCheckIcon />
                <span className="text-[11px] text-[#756D65] font-medium">
                  We respect your privacy. Your information is safe with us.
                </span>
              </div>
            </form>
          </div>

          {/* Right Info Card */}
          <div className="bg-[#FCF8F3] rounded-[20px] p-8 md:p-10 shadow-[0_10px_35px_rgba(58,36,24,0.03)] border border-[#E3D5C8]">
            <h2 className="font-heading text-[28px] text-[var(--lumiere-ink)] mb-8">
              Other ways to reach us
            </h2>

            <div className="flex flex-col gap-8">
              {/* Email */}
              <div className="flex gap-4">
                <div className="flex shrink-0 items-center justify-center size-12 rounded-full bg-[#F3E9DE]">
                  <MailIcon />
                </div>
                <div className="flex flex-col pt-1">
                  <h4 className="text-[14px] font-semibold text-[var(--lumiere-ink)] mb-1">
                    Email Us
                  </h4>
                  <a
                    href="mailto:hello@lumiere.com"
                    className="text-[13px] text-primary hover:underline mb-1"
                  >
                    hello@lumiere.com
                  </a>
                  <p className="text-[11px] text-[#756D65]">We typically reply within 24 hours.</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <div className="flex shrink-0 items-center justify-center size-12 rounded-full bg-[#F3E9DE]">
                  <PhoneIcon />
                </div>
                <div className="flex flex-col pt-1">
                  <h4 className="text-[14px] font-semibold text-[var(--lumiere-ink)] mb-1">
                    Call Us
                  </h4>
                  <a
                    href="tel:+251901234567"
                    className="text-[13px] text-primary hover:underline mb-1"
                  >
                    +251 90 123 4567
                  </a>
                  <p className="text-[11px] text-[#756D65]">Mon – Fri, 9:00 AM – 5:00 PM EAT</p>
                </div>
              </div>

              {/* Studio */}
              <div className="flex gap-4">
                <div className="flex shrink-0 items-center justify-center size-12 rounded-full bg-[#F3E9DE]">
                  <MapPinIcon />
                </div>
                <div className="flex flex-col pt-1">
                  <h4 className="text-[14px] font-semibold text-[var(--lumiere-ink)] mb-1">
                    Our Studio
                  </h4>
                  <p className="text-[13px] text-[#4B4540] mb-1">
                    Bole, Addis Ababa
                    <br />
                    Ethiopia
                  </p>
                  <p className="text-[11px] text-[#756D65]">By appointment only.</p>
                </div>
              </div>

              {/* Wholesale */}
              <div className="flex gap-4">
                <div className="flex shrink-0 items-center justify-center size-12 rounded-full bg-[#F3E9DE]">
                  <HandshakeIcon />
                </div>
                <div className="flex flex-col pt-1">
                  <h4 className="text-[14px] font-semibold text-[var(--lumiere-ink)] mb-1">
                    Wholesale Inquiries
                  </h4>
                  <a
                    href="mailto:partners@lumiere.com"
                    className="text-[13px] text-primary hover:underline mb-1"
                  >
                    partners@lumiere.com
                  </a>
                  <p className="text-[11px] text-[#756D65] leading-snug">
                    Let's build something beautiful together.
                  </p>
                </div>
              </div>
            </div>

            {/* Gift Box */}
            <div className="mt-8 bg-[#F3E9DE] rounded-[14px] p-6 flex gap-4">
              <div className="flex shrink-0 mt-0.5">
                <GiftIcon />
              </div>
              <div className="flex flex-col">
                <h4 className="text-[13px] font-semibold text-[var(--lumiere-ink)] mb-1">
                  Looking for the perfect gift?
                </h4>
                <p className="text-[11px] text-[#4B4540] mb-2">Explore our curated gift sets.</p>
                <Link
                  to={ROUTES.CATALOG}
                  className="text-[12px] font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  View Gift Sets{' '}
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
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Value Strip */}
      <section className="w-full pb-20 px-6 md:px-12 lg:px-16">
        <div className="container mx-auto">
          <div className="w-full bg-[#F3E9DE] rounded-[16px] px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3 text-[var(--lumiere-ink)]">
              <LeafIcon />
              <h3 className="font-heading text-[22px]">We value every connection.</h3>
            </div>
            <div className="flex flex-wrap items-center gap-8 md:gap-12">
              <div className="flex items-center gap-3">
                <HandHeartIcon />
                <div className="flex flex-col">
                  <span className="text-[12px] font-semibold text-[var(--lumiere-ink)]">
                    Personalized Support
                  </span>
                  <span className="text-[10px] text-[var(--lumiere-ink-soft)]">
                    Real people, ready to help.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ClockIcon />
                <div className="flex flex-col">
                  <span className="text-[12px] font-semibold text-[var(--lumiere-ink)]">
                    Quick Responses
                  </span>
                  <span className="text-[10px] text-[var(--lumiere-ink-soft)]">
                    We get back to you fast.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldLargeIcon />
                <div className="flex flex-col">
                  <span className="text-[12px] font-semibold text-[var(--lumiere-ink)]">
                    Trusted & Secure
                  </span>
                  <span className="text-[10px] text-[var(--lumiere-ink-soft)]">
                    Your privacy is our priority.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useRouteError, useNavigate } from 'react-router-dom';
import { RefreshCcw, Home } from 'lucide-react';

export default function GlobalError() {
  const error = useRouteError() as Error & { statusText?: string };
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[var(--lumiere-ivory)] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E8C4AF] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center max-w-[500px]">
        {/* Broken Flame / Alert Icon */}
        <div className="w-20 h-20 mb-8 rounded-full bg-white border border-[#E3D5C8] flex items-center justify-center shadow-sm">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-[#944A27]"
          >
            <path
              d="M12 2c0 0-5 6-5 11 0 3 2 6 5 6s5-3 5-6c0-5-5-11-5-11z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="2"
              y1="2"
              x2="22"
              y2="22"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--lumiere-ink-soft)]"
            />
          </svg>
        </div>

        <h1 className="font-heading text-[48px] text-[var(--lumiere-ink)] leading-tight mb-4">
          Oops! The flame <br />
          went out.
        </h1>

        <p className="text-[14px] text-[#756D65] leading-[1.6] mb-8">
          We encountered an unexpected error while trying to load this page. Don't worry, even the
          best candles flicker sometimes.
          {(error?.statusText || error?.message) && (
            <span className="block mt-4 font-mono text-[11px] text-[#944A27] bg-[#FCF8F3] border border-[#E3D5C8] px-4 py-2 rounded-md max-w-full truncate">
              {error.statusText || error.message}
            </span>
          )}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 w-full sm:w-[160px] h-[48px] rounded-[10px] bg-[#944A27] text-white text-[13px] font-semibold hover:brightness-110 transition-all shadow-sm"
          >
            <RefreshCcw className="size-4" />
            Try Again
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 w-full sm:w-[160px] h-[48px] rounded-[10px] bg-white border border-[#E3D5C8] text-[var(--lumiere-ink)] text-[13px] font-semibold hover:bg-[#FCF8F3] transition-all shadow-sm"
          >
            <Home className="size-4" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

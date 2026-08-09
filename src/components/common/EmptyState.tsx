import type { FC } from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
}

const EmptyState: FC<EmptyStateProps> = ({ message, ctaLabel, ctaHref }) => {
  const showCta = Boolean(ctaLabel && ctaHref);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="text-muted-foreground text-sm">{message}</p>
      {showCta && (
        <Link
          to={ctaHref as string}
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;

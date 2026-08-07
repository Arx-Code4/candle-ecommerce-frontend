import type { FC } from 'react';

interface EmptyStateProps {
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
}

const EmptyState: FC<EmptyStateProps> = () => null;

export default EmptyState;

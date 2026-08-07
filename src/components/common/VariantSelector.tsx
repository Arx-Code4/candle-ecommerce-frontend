import type { FC } from 'react';
import type { ProductVariant } from '@/types';

interface VariantSelectorProps {
  variants: ProductVariant[];
  onSelect: (variant: ProductVariant | null) => void;
}

const VariantSelector: FC<VariantSelectorProps> = () => null;

export default VariantSelector;

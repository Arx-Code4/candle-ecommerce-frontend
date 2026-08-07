import type { FC } from 'react';
import type { ProductVariant } from '@/types';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  primaryPhotoUrl?: string;
  variants: ProductVariant[];
}

const ProductCard: FC<ProductCardProps> = () => null;

export default ProductCard;

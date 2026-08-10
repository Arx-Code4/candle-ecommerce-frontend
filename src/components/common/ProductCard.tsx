import type { FC } from 'react';
import { Link } from 'react-router-dom';
import type { ProductVariant } from '@/types';
import StockBadge from './StockBadge';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  primaryPhotoUrl?: string;
  variants: ProductVariant[];
}

const ProductCard: FC<ProductCardProps> = ({ id, name, price, primaryPhotoUrl, variants }) => {
  const inStock = variants.some((v) => v.stock > 0);

  return (
    <Link
      to={`/products/${id}`}
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground hover:shadow-md transition-shadow"
    >
      <div className="relative">
        <img
          src={primaryPhotoUrl || '/placeholder-candle.png'}
          alt={name}
          className="aspect-square w-full object-cover"
        />
        <div className="absolute left-2 top-2">
          <StockBadge stock={inStock ? 1 : 0} />
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-heading text-sm text-foreground">{name}</h3>
        <span className="text-sm font-semibold">
          <span className="text-muted-foreground mr-1">ETB</span>
          {price.toFixed(2)}
        </span>
      </div>
    </Link>
  );
};

export default ProductCard;

import type { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ProductVariant } from '@/types';

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  primaryPhotoUrl?: string;
  variants: ProductVariant[];
}

const ProductCard: FC<ProductCardProps> = ({ id, name, price, primaryPhotoUrl }) => {
  const navigate = useNavigate();

  // Create a pseudo description based on name
  let description = 'A thoughtfully crafted blend designed to elevate your everyday moments.';
  if (name.toLowerCase().includes('rose') || name.toLowerCase().includes('floral'))
    description = 'A romantic blend of delicate petals and soft musk.';
  if (name.toLowerCase().includes('citrus'))
    description = 'Zesty citrus notes with a hint of warm spices.';
  if (name.toLowerCase().includes('forest') || name.toLowerCase().includes('woody'))
    description = 'Earthy woods and fir balsam for a deep, calming escape.';
  if (name.toLowerCase().includes('vanilla') || name.toLowerCase().includes('sweet'))
    description = 'Creamy vanilla with a touch of caramel and brown sugar.';

  return (
    <Link
      to={`/products/${id}`}
      className="bg-white rounded-[16px] overflow-hidden shadow-[0_10px_35px_rgba(58,36,24,0.03)] border border-[rgba(232,210,193,0.3)] group relative flex flex-col hover:shadow-[0_12px_40px_rgba(58,36,24,0.06)] transition-all duration-300 h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--lumiere-ivory-2)] p-2">
        <img
          src={primaryPhotoUrl || '/images/discovery-candle.webp'}
          alt={name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/discovery-candle.webp';
          }}
          className="w-full h-full object-cover rounded-[10px] transition-transform duration-[400ms] ease-out group-hover:scale-[1.025]"
        />
        {/* Badges / Favorite Button */}
        <div className="absolute top-4 left-4">
          <span className="bg-black/60 text-white backdrop-blur-sm px-2.5 py-1 rounded-[6px] text-[10px] font-semibold tracking-wide">
            In Stock
          </span>
        </div>
        <button
          aria-label={`Add ${name} to favorites`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute top-4 right-4 flex items-center justify-center size-[28px] rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-heading text-[20px] text-[var(--lumiere-ink)] leading-tight mb-2">
          {name}
        </h3>
        <p className="font-sans text-[12px] text-[#756D65] leading-[1.5] mb-6 flex-1">
          {description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className="font-sans text-[13px] font-bold text-[var(--lumiere-ink)]">
            ETB {price}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/products/${id}`);
            }}
            className="bg-[#944A27] text-white px-5 py-2 rounded-[8px] text-[11px] font-semibold hover:brightness-110 transition-all shadow-sm"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

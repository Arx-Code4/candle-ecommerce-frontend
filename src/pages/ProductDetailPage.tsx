// src/pages/ProductDetailPage.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '@/hooks/useProduct';
import { useAddCartItem } from '@/hooks/useAddCartItem';
import { useAuthStore } from '@/store/auth.store';
import PhotoGallery from '@/components/common/PhotoGallery';
import VariantSelector from '@/components/common/VariantSelector';
import { Button } from '@/components/ui/button';
import type { ProductVariant } from '@/types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data: product, isLoading, isError } = useProduct(id as string);
  const addCartItem = useAddCartItem();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  if (isLoading) {
    return <div className="mx-auto max-w-4xl p-6 text-center text-muted-foreground">Loading…</div>;
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-4xl p-6 text-center text-sm text-muted-foreground">
        Product not found or no longer available.
      </div>
    );
  }

  const canAddToCart = !!selectedVariant && selectedVariant.stock > 0;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    setAddError(null);

    if (!accessToken) {
      navigate(
        `/login?pendingVariantId=${selectedVariant.id}&redirect=${encodeURIComponent(
          `/products/${id}`
        )}`
      );
      return;
    }

    addCartItem.mutate(
      { productVariantId: selectedVariant.id, quantity },
      {
        onSuccess: (data) => {
          setFeedback(
            data.wasCapped
              ? (data.message ??
                  `Quantity adjusted to available stock (${data.cappedTo} available)`)
              : 'Added to cart'
          );
        },
        onError: () => {
          setAddError('This item just went out of stock. Please try a different option.');
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-4xl p-6 grid gap-8 md:grid-cols-2">
      <PhotoGallery photos={product.photos ?? []} />

      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-2xl text-foreground">{product.name}</h1>
        <p className="text-sm text-muted-foreground">{product.description}</p>
        <span className="text-lg font-semibold">
          <span className="text-muted-foreground mr-1">ETB</span>
          {product.price.toFixed(2)}
        </span>

        <VariantSelector variants={product.variants} onSelect={setSelectedVariant} />

        <div className="flex items-center gap-2">
          <label htmlFor="quantity" className="text-sm text-foreground">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            className="w-16 rounded-md border border-input px-2 py-1 text-sm"
          />
        </div>

        {feedback && <p className="text-sm text-success-foreground">{feedback}</p>}
        {addError && <p className="text-sm text-destructive">{addError}</p>}

        <Button onClick={handleAddToCart} disabled={!canAddToCart || addCartItem.isPending}>
          {addCartItem.isPending ? 'Adding…' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
}

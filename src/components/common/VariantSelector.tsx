import { useEffect, useState, type FC } from 'react';
import type { ProductVariant } from '@/types';

interface VariantSelectorProps {
  variants: ProductVariant[];
  onSelect: (variant: ProductVariant) => void;
}

const VariantSelector: FC<VariantSelectorProps> = ({ variants, onSelect }) => {
  const [selectedScent, setSelectedScent] = useState<string | null>(() =>
    variants.length === 1 ? variants[0].scent : null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(() =>
    variants.length === 1 ? variants[0].size : null
  );
  const scents = [...new Set(variants.map((v) => v.scent))];
  const sizes = [...new Set(variants.map((v) => v.size))];

  // Fires onSelect exactly when scent+size resolve to one real, purchasable
  // variant — not on every keystroke of partial selection.
  useEffect(() => {
    if (!selectedScent || !selectedSize) return;
    const match = variants.find((v) => v.scent === selectedScent && v.size === selectedSize);
    if (match) onSelect(match);
  }, [selectedScent, selectedSize, variants, onSelect]);

  // A size is purchasable only if a variant exists for the CURRENTLY
  // selected scent, at that size, with stock left. Before any scent is
  // chosen, selectedScent is null — no variant's scent ever equals null,
  // so every size option is naturally (not specially-cased) disabled until
  // a scent is picked.
  const isSizeDisabled = (size: string) =>
    !variants.some((v) => v.scent === selectedScent && v.size === size && v.stock > 0);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Scent</p>
        <div role="listbox" aria-label="Scent" className="flex flex-wrap gap-2">
          {scents.map((scent) => (
            <button
              key={scent}
              type="button"
              role="option"
              aria-selected={selectedScent === scent}
              onClick={() => setSelectedScent(scent)}
              className={`rounded-full border px-3 py-1.5 text-sm capitalize transition-colors ${
                selectedScent === scent
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background text-foreground hover:bg-muted'
              }`}
            >
              {scent}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Size</p>
        <div role="listbox" aria-label="Size" className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const disabled = isSizeDisabled(size);
            return (
              <button
                key={size}
                type="button"
                role="option"
                aria-selected={selectedSize === size}
                disabled={disabled}
                onClick={() => setSelectedSize(size)}
                className={`rounded-full border px-3 py-1.5 text-sm capitalize transition-colors ${
                  disabled
                    ? 'cursor-not-allowed border-input bg-muted text-muted-foreground opacity-50'
                    : selectedSize === size
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background text-foreground hover:bg-muted'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VariantSelector;

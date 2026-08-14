import { Controller, useFieldArray, useWatch, type Control } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AdminProductFormValues } from '@/types';

interface VariantEditorFieldArrayProps {
  control: Control<AdminProductFormValues>;
}

function normalizePair(scent: string, size: string) {
  return `${scent.trim().toLowerCase()}|${size.trim().toLowerCase()}`;
}

export default function VariantEditorFieldArray({ control }: VariantEditorFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });
  const variants = useWatch({ control, name: 'variants' }) ?? [];

  const duplicateIndexes = new Set<number>();
  const seen = new Map<string, number>();
  variants.forEach((variant, index) => {
    const scent = variant?.scent ?? '';
    const size = variant?.size ?? '';
    if (!scent.trim() || !size.trim()) return;
    const key = normalizePair(scent, size);
    const first = seen.get(key);
    if (first !== undefined) {
      duplicateIndexes.add(first);
      duplicateIndexes.add(index);
    } else {
      seen.set(key, index);
    }
  });

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-foreground">Variants</legend>
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-2 rounded-lg border border-border bg-card p-3">
          <Controller
            control={control}
            name={`variants.${index}.id`}
            render={({ field: idField }) => (
              <input type="hidden" value={idField.value ?? ''} onChange={idField.onChange} />
            )}
          />
          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor={`variants.${index}.scent`}>Scent</Label>
              <Controller
                control={control}
                name={`variants.${index}.scent`}
                render={({ field: scentField }) => (
                  <Input id={`variants.${index}.scent`} {...scentField} />
                )}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`variants.${index}.size`}>Size</Label>
              <Controller
                control={control}
                name={`variants.${index}.size`}
                render={({ field: sizeField }) => (
                  <Input id={`variants.${index}.size`} {...sizeField} />
                )}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`variants.${index}.stock`}>Stock</Label>
              <Controller
                control={control}
                name={`variants.${index}.stock`}
                render={({ field: stockField }) => (
                  <Input
                    id={`variants.${index}.stock`}
                    type="number"
                    value={stockField.value ?? 0}
                    onChange={(e) => stockField.onChange(Number(e.target.value))}
                  />
                )}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="self-end"
              disabled={fields.length === 1}
              onClick={() => remove(index)}
            >
              Remove
            </Button>
          </div>
          {duplicateIndexes.has(index) && (
            <p className="text-sm text-destructive">Duplicate scent/size combination</p>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={() => append({ scent: '', size: '', stock: 0 })}
      >
        Add Variant
      </Button>
    </fieldset>
  );
}

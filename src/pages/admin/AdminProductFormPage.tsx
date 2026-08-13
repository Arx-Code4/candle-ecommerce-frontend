import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isAxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { useCreateAdminProduct } from '@/hooks/useCreateAdminProduct';
import { useUpdateAdminProduct } from '@/hooks/useUpdateAdminProduct';
import PhotoUrlFieldArray from '@/components/common/PhotoUrlFieldArray';
import VariantEditorFieldArray from '@/components/common/VariantEditorFieldArray';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/lib/toast';
import { ROUTES } from '@/constants';
import type { AdminProductFormValues } from '@/types';

const adminProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().positive(),
  photos: z
    .array(
      z.object({
        url: z.string().url(),
        sortOrder: z.number().optional(),
      })
    )
    .min(1),
  variants: z
    .array(
      z.object({
        id: z.string().uuid().optional().or(z.literal('')),
        scent: z.string().min(1),
        size: z.string().min(1),
        stock: z.number().int().min(0),
      })
    )
    .min(1, 'At least one variant is required'),
});

const emptyValues: AdminProductFormValues = {
  name: '',
  description: '',
  price: undefined as unknown as number,
  photos: [{ url: '', sortOrder: 0 }],
  variants: [{ scent: '', size: '', stock: 0 }],
};

function normalizePhotos(
  photos: AdminProductFormValues['photos']
): AdminProductFormValues['photos'] {
  return photos.map((photo, index) => ({
    url: photo.url,
    sortOrder: photo.sortOrder ?? index,
  }));
}

function normalizeVariants(variants: AdminProductFormValues['variants']) {
  return variants.map((variant) => ({
    ...variant,
    id: variant.id ? variant.id : undefined,
  }));
}

export default function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data, isLoading } = useAdminProducts();
  const { mutateAsync: createProduct, isPending: isCreating } = useCreateAdminProduct();
  const { mutateAsync: updateProduct, isPending: isUpdating } = useUpdateAdminProduct();

  const matchedProduct = isEdit ? data?.items.find((product) => product.id === id) : undefined;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AdminProductFormValues>({
    resolver: zodResolver(adminProductSchema) as Resolver<AdminProductFormValues>,
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isEdit || !matchedProduct) return;
    reset({
      name: matchedProduct.name,
      description: matchedProduct.description ?? '',
      price: matchedProduct.price,
      photos:
        matchedProduct.photos?.length > 0
          ? matchedProduct.photos.map((photo) => ({ url: photo.url, sortOrder: photo.sortOrder }))
          : [{ url: matchedProduct.primaryPhotoUrl ?? '', sortOrder: 0 }],
      variants:
        matchedProduct.variants.length > 0
          ? matchedProduct.variants.map((variant) => ({
              id: variant.id,
              scent: variant.scent,
              size: variant.size,
              stock: variant.stock,
            }))
          : [{ scent: '', size: '', stock: 0 }],
    });
  }, [isEdit, matchedProduct, reset]);

  const onSubmit = async (values: AdminProductFormValues) => {
    const payload = {
      ...values,
      photos: normalizePhotos(values.photos),
      variants: normalizeVariants(values.variants),
    };

    try {
      if (isEdit && id) {
        await updateProduct({ id, ...payload });
        toast.success('Product updated');
      } else {
        await createProduct(payload);
        toast.success('Product created');
      }
      if (typeof navigate === 'function') navigate(ROUTES.ADMIN_PRODUCTS);
    } catch (error) {
      const message = isAxiosError(error) ? String(error.response?.data?.message ?? '') : '';

      if (
        (isAxiosError(error) && error.response?.status === 409) ||
        /cannot remove a variant with existing orders/i.test(message)
      ) {
        setError('root', {
          message:
            'Cannot remove a variant with existing orders. Set that variant’s stock to 0 instead of deleting the row.',
        });
        return;
      }

      setError('root', {
        message: message || 'Could not save the product. Please try again.',
      });
    }
  };

  if (isEdit && isLoading) {
    return <p className="text-sm text-muted-foreground">Loading product…</p>;
  }

  if (isEdit && !isLoading && !matchedProduct) {
    return <p className="text-sm text-destructive">Product not found.</p>;
  }

  const pending = isSubmitting || isCreating || isUpdating;

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit product' : 'Add product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
            />
            {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
          </div>

          <PhotoUrlFieldArray control={control} />
          {errors.photos && (
            <p className="text-sm text-destructive">
              {errors.photos.message ?? errors.photos.root?.message}
            </p>
          )}

          <VariantEditorFieldArray control={control} />
          {errors.variants && (
            <p className="text-sm text-destructive">
              {errors.variants.message ??
                errors.variants.root?.message ??
                'At least one variant is required'}
            </p>
          )}

          {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Save'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

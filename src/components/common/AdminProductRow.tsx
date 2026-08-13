import { Link } from 'react-router-dom';
import StockBadge from '@/components/common/StockBadge';
import { Button } from '@/components/ui/button';
import { useUpdateAdminProductStatus } from '@/hooks/useUpdateAdminProductStatus';
import { adminProductEditPath } from '@/constants';
import type { AdminProductSummary } from '@/types';

interface AdminProductRowProps {
  product: AdminProductSummary;
}

function stockSummary(product: AdminProductSummary) {
  const stocks = product.variants.map((v) => v.stock);
  if (stocks.length === 0) return { kind: 'badge' as const, stock: 0 };
  const hasZero = stocks.some((s) => s === 0);
  const hasPositive = stocks.some((s) => s > 0);
  if (hasZero && hasPositive) return { kind: 'mixed' as const };
  return { kind: 'badge' as const, stock: Math.min(...stocks) };
}

export default function AdminProductRow({ product }: AdminProductRowProps) {
  const { mutate, isPending } = useUpdateAdminProductStatus();
  const thumbnail = product.primaryPhotoUrl ?? product.photos?.[0]?.url ?? '';
  const summary = stockSummary(product);

  return (
    <article className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground">
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={product.name}
          className="size-16 rounded-lg object-cover bg-muted"
        />
      ) : (
        <div className="size-16 rounded-lg bg-muted" aria-hidden />
      )}

      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">
          {product.name}{' '}
          <span className="text-xs font-normal text-muted-foreground">
            {product.isPublished ? 'Published' : 'Draft'}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">{product.price}</p>
        {summary.kind === 'mixed' ? (
          <span className="mt-1 inline-flex items-center rounded-full bg-warning px-2.5 py-0.5 text-xs font-medium text-warning-foreground">
            Mixed
          </span>
        ) : (
          <div className="mt-1">
            <StockBadge stock={summary.stock} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          aria-label={product.isPublished ? `Unpublish ${product.name}` : `Publish ${product.name}`}
          onClick={() => mutate({ id: product.id, isPublished: !product.isPublished })}
        >
          {isPending ? 'Updating…' : product.isPublished ? 'Unpublish' : 'Publish'}
        </Button>
        <Link
          to={adminProductEditPath(product.id)}
          aria-label={`Edit ${product.name}`}
          className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          Edit
        </Link>
      </div>
    </article>
  );
}

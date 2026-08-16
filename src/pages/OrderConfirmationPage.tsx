// src/pages/OrderConfirmationPage.tsx
import { Link, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants';

const DEFAULT_COPY = {
  heading: 'Confirming your payment',
  message: "We're confirming your payment. You'll receive an email confirmation shortly.",
};

export default function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const txRef = searchParams.get('tx_ref');

  const copy = DEFAULT_COPY;

  return (
    <div className="mx-auto max-w-2xl p-6 text-center">
      <h1 className="font-heading text-2xl text-foreground mb-2">{copy.heading}</h1>
      <p className="text-sm text-muted-foreground mb-1">{copy.message}</p>
      {txRef && (
        <p className="text-xs text-muted-foreground mb-6">
          Reference: <span className="font-mono">{txRef}</span>
        </p>
      )}
      <Link to={ROUTES.ORDERS} className="text-sm underline text-primary">
        View Order History
      </Link>
    </div>
  );
}

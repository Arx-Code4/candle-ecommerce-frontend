import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
// import type { AxiosError } from 'axios';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import CartSummary from '@/components/common/CartSummary';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';

const shippingSchema = z.object({
  shippingName: z.string().min(1, 'Shipping name is required'),
  shippingPhone: z.string().min(1, 'Shipping phone is required'),
  shippingAddress: z.string().min(1, 'Shipping address is required'),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

// Real backend shape (checkout.service.ts + error.middleware.ts):
// { statusCode, success: false, message, errors: string[] }
// `errors` is a flat array of pre-formatted strings on a 409 conflict,
// and an empty/absent array for every other error.
interface CheckoutErrorData {
  message?: string;
  errors?: string[];
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCart();
  const checkout = useCheckout();

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
  });

  // Empty cart AND "every item unavailable" are treated identically —
  // there's nothing payable either way, so both send the shopper back
  // to /cart rather than showing a checkout form with no purchasable
  // items in it.
  const isUnshoppable =
    !cart || cart.items.length === 0 || cart.items.every((item) => !item.available);

  useEffect(() => {
    // Gated on !isLoading so this never fires while the cart query is
    // still in flight (cart is undefined during loading, which would
    // otherwise make isUnshoppable true and redirect prematurely).
    if (!isLoading && isUnshoppable) {
      navigate(ROUTES.CART);
    }
  }, [isLoading, isUnshoppable, navigate]);

  const onSubmit = (data: ShippingFormValues) => {
    checkout.mutate(data);
  };

  if (isLoading) {
    return (
      <div data-testid="checkout-loading" className="py-16 text-center text-muted-foreground">
        Loading your cart…
      </div>
    );
  }

  if (isUnshoppable) {
    // The useEffect above is already navigating away — render nothing
    // rather than flashing an empty/broken form during that transition.
    return null;
  }

  const errorData = checkout.error?.response?.data as CheckoutErrorData | undefined;
  const isConflict = checkout.isError && checkout.error?.response?.status === 409;
  const conflictItems = isConflict ? (errorData?.errors ?? []) : [];
  const rootErrorMessage =
    checkout.isError && !isConflict
      ? (errorData?.message ?? 'Something went wrong. Please try again.')
      : null;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 font-heading text-2xl text-foreground">Checkout</h1>

      <CartSummary total={cart.total} itemCount={cart.items.length} readOnly />

      {isConflict && conflictItems.length > 0 && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive mb-1">
            Some items in your cart are no longer available:
          </p>
          <ul className="list-disc pl-5 text-sm text-destructive">
            {conflictItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link to={ROUTES.CART} className="mt-2 inline-block text-sm underline text-destructive">
            Back to your cart
          </Link>
        </div>
      )}

      {rootErrorMessage && (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {rootErrorMessage}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="shippingName" className="mb-1 block text-sm font-medium text-foreground">
            Shipping Name
          </label>
          <input
            id="shippingName"
            className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background"
            {...register('shippingName')}
          />
          {formErrors.shippingName && (
            <p className="mt-1 text-xs text-destructive">{formErrors.shippingName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="shippingPhone" className="mb-1 block text-sm font-medium text-foreground">
            Shipping Phone
          </label>
          <input
            id="shippingPhone"
            className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background"
            {...register('shippingPhone')}
          />
          {formErrors.shippingPhone && (
            <p className="mt-1 text-xs text-destructive">{formErrors.shippingPhone.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="shippingAddress"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Shipping Address
          </label>
          <input
            id="shippingAddress"
            className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background"
            {...register('shippingAddress')}
          />
          {formErrors.shippingAddress && (
            <p className="mt-1 text-xs text-destructive">{formErrors.shippingAddress.message}</p>
          )}
        </div>

        <Button type="submit" disabled={checkout.isPending} className="mt-2">
          {checkout.isPending ? 'Pay with Chapa…' : 'Pay with Chapa'}
        </Button>
      </form>
    </div>
  );
}

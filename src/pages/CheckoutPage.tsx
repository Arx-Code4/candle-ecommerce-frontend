import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import CartSummary from '@/components/common/CartSummary';
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
      <div
        data-testid="checkout-skeleton"
        className="mx-auto max-w-[1200px] px-6 md:px-12 lg:px-16 pt-[140px] pb-24 lg:grid lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_480px] gap-12 xl:gap-20"
      >
        <div className="h-[400px] animate-pulse rounded-[16px] bg-[#E3D5C8]/20" />
        <div className="h-[300px] animate-pulse rounded-[16px] bg-[#E3D5C8]/20 mt-12 lg:mt-0" />
      </div>
    );
  }

  if (isUnshoppable || !cart) {
    // The useEffect above is already navigating away — render nothing
    // rather than flashing an empty/broken form during that transition.
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAxiosLike = (err: any): err is { response: any; message: string } =>
    err && typeof err === 'object' && 'response' in err;

  const err = checkout.error;
  const isConflict = isAxiosLike(err) && err.response?.status === 409;

  const conflictItems =
    isAxiosLike(err) && isConflict && err.response?.data?.errors
      ? (err.response.data.errors as string[])
      : [];

  const rootErrorMessage =
    err && !isConflict
      ? isAxiosLike(err) && err.response?.data?.message
        ? err.response.data.message
        : err instanceof Error
          ? err.message
          : 'Checkout failed'
      : null;

  return (
    <div className="mx-auto max-w-[1200px] px-6 md:px-12 lg:px-16 pt-[140px] pb-24">
      <div className="lg:grid lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_480px] gap-12 xl:gap-20 items-start">
        {/* Left Column - Form */}
        <div className="flex flex-col">
          <h1 className="mb-2 font-heading text-[32px] md:text-[40px] text-[var(--lumiere-ink)] leading-tight">
            Checkout
          </h1>
          <p className="text-[13px] text-[#756D65] mb-10">
            Please enter your shipping details below.
          </p>

          {isConflict && conflictItems.length > 0 && (
            <div className="mb-8 rounded-[12px] border border-red-200 bg-red-50 p-5">
              <p className="text-[13px] font-semibold text-red-700 mb-2">
                Some items in your cart are no longer available:
              </p>
              <ul className="list-disc pl-5 text-[13px] text-red-600 mb-4">
                {conflictItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link
                to={ROUTES.CART}
                className="inline-block text-[12px] font-medium underline text-red-700 hover:text-red-800 transition-colors"
              >
                Back to your cart
              </Link>
            </div>
          )}

          {rootErrorMessage && (
            <p className="mb-8 rounded-[12px] border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">
              {rootErrorMessage}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div>
              <label
                htmlFor="shippingName"
                className="mb-2 block text-[13px] font-semibold text-[var(--lumiere-ink)]"
              >
                Full Name
              </label>
              <input
                id="shippingName"
                className="w-full h-[48px] rounded-[10px] border border-[#E3D5C8] px-4 text-[14px] bg-white text-[var(--lumiere-ink)] placeholder-[#A39B93] focus:outline-none focus:border-[#944A27] focus:ring-1 focus:ring-[#944A27] transition-all shadow-sm"
                placeholder="Abebe Bikila"
                {...register('shippingName')}
              />
              {formErrors.shippingName && (
                <p className="mt-1.5 text-[11px] font-medium text-red-600">
                  {formErrors.shippingName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="shippingPhone"
                className="mb-2 block text-[13px] font-semibold text-[var(--lumiere-ink)]"
              >
                Phone Number
              </label>
              <input
                id="shippingPhone"
                className="w-full h-[48px] rounded-[10px] border border-[#E3D5C8] px-4 text-[14px] bg-white text-[var(--lumiere-ink)] placeholder-[#A39B93] focus:outline-none focus:border-[#944A27] focus:ring-1 focus:ring-[#944A27] transition-all shadow-sm"
                placeholder="0911234567"
                {...register('shippingPhone')}
              />
              {formErrors.shippingPhone && (
                <p className="mt-1.5 text-[11px] font-medium text-red-600">
                  {formErrors.shippingPhone.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="shippingAddress"
                className="mb-2 block text-[13px] font-semibold text-[var(--lumiere-ink)]"
              >
                Shipping Address
              </label>
              <input
                id="shippingAddress"
                className="w-full h-[48px] rounded-[10px] border border-[#E3D5C8] px-4 text-[14px] bg-white text-[var(--lumiere-ink)] placeholder-[#A39B93] focus:outline-none focus:border-[#944A27] focus:ring-1 focus:ring-[#944A27] transition-all shadow-sm"
                placeholder="Bole, Addis Ababa"
                {...register('shippingAddress')}
              />
              {formErrors.shippingAddress && (
                <p className="mt-1.5 text-[11px] font-medium text-red-600">
                  {formErrors.shippingAddress.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={checkout.isPending}
              className="mt-6 w-full h-[52px] rounded-[10px] bg-[#944A27] text-white text-[13px] font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-sm disabled:opacity-50 disabled:hover:brightness-100"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              {checkout.isPending ? 'Processing...' : 'Pay with Chapa'}
            </button>
            <p className="text-center text-[11px] text-[#756D65] mt-1 font-medium">
              Secure transaction via Chapa
            </p>
          </form>
        </div>

        {/* Right Column - Summary */}
        <div className="mt-12 lg:mt-0 lg:sticky lg:top-[140px]">
          <CartSummary total={cart.total} itemCount={cart.items.length} readOnly />
        </div>
      </div>
    </div>
  );
}

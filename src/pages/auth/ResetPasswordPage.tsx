// src/pages/auth/ResetPasswordPage.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPassword } from '@/hooks/useResetPassword';
import { toast } from '@/lib/toast';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants';
import { isAxiosError } from 'axios';

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  });

  const { mutateAsync, isPending } = useResetPassword();

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      clearErrors('root');
      await mutateAsync({ token: token || '', newPassword: data.newPassword });
      toast.success('Password reset successful!');
      navigate(ROUTES.LOGIN);
    } catch (error) {
      // Known backend 400 messages
      if (isAxiosError(error) && error.response?.status === 400) {
        const message = error.response.data?.message;
        if (
          message &&
          [
            'Invalid reset link',
            'Reset link has expired',
            'Reset link has already been used',
          ].includes(message)
        ) {
          setError('root', { message });
          return;
        }
      }
      // Any other error (500, network drop, etc.)
      setError('root', { message: 'An unexpected error occurred' });
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left brand panel – hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 shrink-0 relative flex-col justify-end p-16 bg-[url('https://images.unsplash.com/photo-1602874801007-bd458fc10915?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="relative z-10 text-white pb-20 pl-4">
          <h1 className="font-heading text-display-lg tracking-[0.15em] mb-4 uppercase text-white/90">
            LUMIÈRE
          </h1>
          <p className="font-heading text-headline-lg leading-[1.2] text-white/90 max-w-md">
            Hand-poured.
            <br />
            Soul-warmed.
            <br />
            Curate a collection worth coming home to.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-16 bg-surface">
        <div className="w-full max-w-[420px]">
          <div className="mb-14 text-left">
            <h2 className="font-heading text-headline-md text-foreground mb-2">
              Reset your password.
            </h2>
            <p className="font-body text-body-md text-on-surface-variant">
              Enter your new password below.
            </p>
          </div>

          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* New Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="font-label text-label-md text-foreground">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="New password"
                    className="h-14 rounded-full border-outline-variant/50 bg-surface-container-high/30 px-4 font-body text-body-md placeholder:text-on-surface-variant/50 focus-visible:ring-1 focus-visible:ring-ring"
                    {...register('newPassword')}
                  />
                  {errors.newPassword && (
                    <p className="font-label text-label-sm text-error mt-2">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="font-label text-label-md text-foreground"
                  >
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    className="h-14 rounded-full border-outline-variant/50 bg-surface-container-high/30 px-4 font-body text-body-md placeholder:text-on-surface-variant/50 focus-visible:ring-1 focus-visible:ring-ring"
                    aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <p id="confirm-error" className="font-label text-label-sm text-error mt-2">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Root Error */}
                {errors.root && (
                  <p className="font-label text-label-sm text-error text-center">
                    {errors.root.message}
                  </p>
                )}

                {/* REVERTED: Dynamic text shows "Resetting…" when pending */}
                <Button
                  type="submit"
                  className="w-full h-14 rounded-full bg-primary !text-primary-foreground hover:bg-primary/90 font-label text-label-md transition-colors"
                  disabled={isSubmitting || isPending}
                >
                  {isSubmitting || isPending ? 'Resetting…' : 'Reset password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-10 text-center">
            <p className="font-body text-body-md text-on-surface-variant">
              Remembered it?{' '}
              <Link
                to={ROUTES.LOGIN}
                className="text-primary hover:text-primary/80 underline underline-offset-4 decoration-primary/30 transition-colors"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

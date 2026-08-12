// src/pages/auth/ForgotPasswordPage.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForgotPassword } from '@/hooks/useForgotPassword';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  });

  const { mutateAsync, isSuccess, isPending } = useForgotPassword();

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    await mutateAsync(data);
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left brand panel – hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 shrink-0 relative flex-col justify-end p-16 bg-[url('https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
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
          {!isSuccess ? (
            <>
              <div className="mb-14 text-left">
                <h2 className="font-heading text-headline-md text-foreground mb-2">
                  Reset your password.
                </h2>
                <p className="font-body text-body-md text-on-surface-variant">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-label text-label-md text-foreground">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@email.com"
                        className="h-14 rounded-full border-outline-variant/50 bg-surface-container-high/30 px-4 font-body text-body-md placeholder:text-on-surface-variant/50 focus-visible:ring-1 focus-visible:ring-ring"
                        {...register('email')}
                      />
                      {errors.email && (
                        <p className="font-label text-label-sm text-error mt-2">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-14 rounded-full bg-primary !text-primary-foreground hover:bg-primary/90 font-label text-label-md transition-colors"
                      disabled={isSubmitting || isPending}
                    >
                      {isSubmitting || isPending ? 'Sending…' : 'Send reset link'}
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
            </>
          ) : (
            // Success state – in-place message swap
            <div className="text-center space-y-4">
              <h2 className="font-heading text-headline-md text-foreground">Check your email.</h2>
              <p className="font-body text-body-md text-on-surface-variant max-w-sm mx-auto">
                If that email is registered, a reset link has been sent.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

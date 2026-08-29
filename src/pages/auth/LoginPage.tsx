// src/pages/auth/LoginPage.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '@/hooks/useLogin';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const { mutateAsync, isPending } = useLogin();

  const onSubmit = async (data: LoginFormValues) => {
    try {
      clearErrors('root');
      await mutateAsync(data);
    } catch {
      setError('root', {
        message: 'Invalid email or password',
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* LEFT PANEL - Exact 50% width with large serif text */}
      <div className="hidden md:flex md:w-1/2 shrink-0 relative flex-col justify-end p-16 bg-[url('https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        <div className="relative z-10 text-white pb-20 pl-4">
          {/* LUMIÈRE - Massive, wide tracked */}
          <h1 className="font-heading text-display-lg tracking-[0.15em] mb-4 uppercase text-white/90">
            LUMIÈRE
          </h1>

          {/* Tagline - 3 distinct lines with loose line-height */}
          <p className="font-heading text-headline-lg leading-[1.2] text-white/90 max-w-md">
            Hand-poured.
            <br />
            Soul-warmed.
            <br />
            Curate a collection worth coming home to.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - Form, perfectly centered */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-16 bg-surface">
        <div className="w-full max-w-[420px]">
          {/* Header - Generous space below (mb-14) */}
          <div className="mb-14 text-left">
            <h2 className="font-heading text-headline-md text-foreground mb-2">
              Curate your collection.
            </h2>
            <p className="font-body text-body-md text-on-surface-variant">
              Please login to continue.
            </p>
          </div>

          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
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

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="font-label text-label-md text-foreground">
                      Password
                    </Label>
                    <Link
                      to={ROUTES.FORGOT_PASSWORD}
                      className="font-label text-label-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-14 rounded-full border-outline-variant/50 bg-surface-container-high/30 px-4 pr-12 font-body text-body-md placeholder:text-on-surface-variant/50 focus-visible:ring-1 focus-visible:ring-ring"
                    {...register('password')}
                  />
                  {errors.password && (
                    <p className="font-label text-label-sm text-error mt-2">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Root Error */}
                {errors.root && (
                  <p className="font-label text-label-sm text-error text-center">
                    {errors.root.message}
                  </p>
                )}

                {/* LOGIN BUTTON - Fixed to h-14, rounded-full, and explicit text-white */}
                <Button
                  type="submit"
                  className="w-full h-14 rounded-full bg-primary !text-primary-foreground hover:bg-primary/90 font-label text-label-md transition-colors"
                  disabled={isSubmitting || isPending}
                >
                  {isSubmitting || isPending ? 'Signing in…' : 'Login'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* DEMO CREDENTIALS BOX */}
          <div className="mt-8 p-6 bg-surface-container-low rounded-xl border border-outline-variant/30">
            <h3 className="font-label text-label-sm text-on-surface-variant mb-4 uppercase tracking-wider">
              Demo credentials
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-body text-body-md text-on-surface text-sm">
                  Customer - selam@lumiere.et
                </span>
                <button
                  type="button"
                  className="font-label text-label-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Use
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body text-body-md text-on-surface text-sm">
                  Admin - admin@lumiere.et
                </span>
                <button
                  type="button"
                  className="font-label text-label-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Use
                </button>
              </div>
            </div>
          </div>

          {/* FOOTER LINK */}
          <div className="mt-10 text-center">
            <p className="font-body text-body-md text-on-surface-variant">
              New here?{' '}
              <Link
                to={ROUTES.REGISTER}
                className="text-primary hover:text-primary/80 underline underline-offset-4 decoration-primary/30 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

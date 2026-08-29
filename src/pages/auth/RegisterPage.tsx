// src/pages/auth/RegisterPage.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister } from '@/hooks/useRegister';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { isAxiosError } from 'axios';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const { mutateAsync, isPending } = useRegister();

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      clearErrors('root');
      await mutateAsync(data);
    } catch (error) {
      // 409 - Duplicate email
      if (isAxiosError(error) && error.response?.status === 409) {
        setError('root', {
          message: 'Email already in use',
        });
        return;
      }

      // All other errors (400, 500, network failure, etc.)
      setError('root', {
        message: 'An unexpected error occurred',
      });
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
              Curate your collection.
            </h2>
            <p className="font-body text-body-md text-on-surface-variant">
              Create an account to begin.
            </p>
          </div>

          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-label text-label-md text-foreground">
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    className="h-14 rounded-full border-outline-variant/50 bg-surface-container-high/30 px-4 font-body text-body-md placeholder:text-on-surface-variant/50 focus-visible:ring-1 focus-visible:ring-ring"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="font-label text-label-sm text-error mt-2">
                      {errors.name.message}
                    </p>
                  )}
                </div>

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
                  <Label htmlFor="password" className="font-label text-label-md text-foreground">
                    Password
                  </Label>
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

                <Button
                  type="submit"
                  className="w-full h-14 rounded-full bg-primary !text-primary-foreground hover:bg-primary/90 font-label text-label-md transition-colors"
                  disabled={isSubmitting || isPending}
                >
                  {isSubmitting || isPending ? 'Creating account…' : 'Create Account'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-10 text-center">
            <p className="font-body text-body-md text-on-surface-variant">
              Already have an account?{' '}
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

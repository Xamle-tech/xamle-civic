'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { RegisterSchema } from '@xamle/types';
import type { RegisterDto } from '@xamle/types';
import { register as apiRegister } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { Button, Input, Card, CardContent } from '@xamle/ui';

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const router = useRouter();
  const { setUser } = useUserStore();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterDto>({
    resolver: zodResolver(RegisterSchema),
  });

  const mutation = useMutation({
    mutationFn: apiRegister,
    onSuccess: (data) => {
      setUser(data.user, data.accessToken, data.expiresIn);
      router.push('/dashboard/overview');
    },
  });

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-civic-red font-bold text-xl">
            Xamle Civic
          </Link>
          <h1 className="mt-4 text-2xl font-bold">{t('title')}</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="space-y-4">
              <div>
                <label htmlFor="name" className="text-sm font-medium mb-1.5 block">{t('name')}</label>
                <Input id="name" type="text" autoComplete="name" {...register('name')} error={errors.name?.message} />
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-medium mb-1.5 block">{t('email')}</label>
                <Input id="email" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} />
              </div>

              <div>
                <label htmlFor="phone" className="text-sm font-medium mb-1.5 block">
                  {t('phone')} <span className="text-muted-foreground">(optionnel)</span>
                </label>
                <Input id="phone" type="tel" autoComplete="tel" {...register('phone')} error={errors.phone?.message} />
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium mb-1.5 block">{t('password')}</label>
                <Input id="password" type="password" autoComplete="new-password" {...register('password')} error={errors.password?.message} />
                <p className="mt-1 text-xs text-muted-foreground">{t('passwordHint')}</p>
              </div>

              <div className="flex items-start gap-2">
                <input
                  id="consent"
                  type="checkbox"
                  {...register('consent')}
                  className="mt-1 h-4 w-4 rounded border-input accent-civic-red focus-visible:ring-civic-red"
                />
                <label htmlFor="consent" className="text-sm text-muted-foreground">
                  {t('consent')}{' '}
                  <Link href="/legal/privacy" className="text-civic-red hover:underline">
                    politique de confidentialité
                  </Link>
                </label>
              </div>
              {errors.consent && <p className="text-xs text-destructive">{errors.consent.message}</p>}

              {mutation.isError && (
                <p className="text-sm text-destructive" role="alert">{(mutation.error as Error).message}</p>
              )}

              <Button type="submit" className="w-full" loading={mutation.isPending}>
                {t('submit')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          {t('alreadyHaveAccount')}{' '}
          <Link href="/auth/login" className="text-civic-red font-medium hover:underline">
            {t('login')}
          </Link>
        </p>
      </div>
    </main>
  );
}

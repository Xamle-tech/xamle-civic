'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { LoginSchema } from '@xamle/types';
import type { LoginDto } from '@xamle/types';
import { login } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { Button, Input, Card, CardContent } from '@xamle/ui';

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useUserStore();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginDto>({
    resolver: zodResolver(LoginSchema),
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      console.log('[LOGIN] Success:', { email: data.user.email, role: data.user.role });
      
      // Set user state and cookies
      setUser(data.user, data.accessToken, data.expiresIn);
      
      // Wait for cookies to be set before redirect
      setTimeout(() => {
        // Redirection selon le rôle ou le paramètre redirect (sécurisé)
        const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR'];
        const isAdmin = adminRoles.includes(data.user.role);
        const requestedRedirect = searchParams.get('redirect');
        const safeRedirect =
          requestedRedirect?.startsWith('/') && !requestedRedirect.startsWith('//')
            ? requestedRedirect
            : null;
        const target =
          safeRedirect ?? (isAdmin ? '/admin/policies' : '/dashboard/overview');
        
        console.log('[LOGIN] Redirecting to:', target);
        router.push(target);
      }, 100);
    },
    onError: (error) => {
      console.error('[LOGIN] Error:', error);
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
                <label htmlFor="email" className="text-sm font-medium mb-1.5 block">
                  {t('email')}
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  error={errors.email?.message}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="text-sm font-medium">
                    {t('password')}
                  </label>
                  <Link href="/auth/forgot-password" className="text-xs text-civic-red hover:underline">
                    {t('forgotPassword')}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                  error={errors.password?.message}
                />
              </div>

              {mutation.isError && (
                <p className="text-sm text-destructive" role="alert">
                  {(mutation.error as Error).message}
                </p>
              )}

              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-muted-foreground border border-border rounded-lg p-3 bg-muted/50 space-y-1">
                  <p className="font-medium text-foreground">Comptes de démo (mot de passe : Admin@1234)</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>admin@xamle.sn — Super Admin</li>
                    <li>moderateur@xamle.sn — Modérateur</li>
                    <li>editeur@xamle.sn — Éditeur</li>
                    <li>citoyen@example.sn — Citoyen</li>
                  </ul>
                  <p className="text-[11px] pt-1">A majuscule dans Admin@1234</p>
                </div>
              )}

              <Button type="submit" className="w-full" loading={mutation.isPending}>
                {t('submit')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

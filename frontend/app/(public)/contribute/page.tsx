'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { CreateContributionSchema, ContributionType } from '@xamle/types';
import type { CreateContributionDto } from '@xamle/types';
import { fetchPolicies, fetchPolicyBySlug, createContribution } from '@/lib/api';
import { Button, Input, Card, CardContent, Skeleton } from '@xamle/ui';

const CONTRIBUTION_TYPES = [
  ContributionType.TESTIMONY,
  ContributionType.DOCUMENT,
  ContributionType.LINK,
  ContributionType.PHOTO,
] as const;

export default function ContributePage() {
  const t = useTranslations('contributions');
  const searchParams = useSearchParams();
  const policySlug = searchParams.get('policy');
  const [policyId, setPolicyId] = useState<string | null>(null);

  const { data: policiesData, isLoading: loadingPolicies } = useQuery({
    queryKey: ['policies-list'],
    queryFn: () => fetchPolicies(new URLSearchParams({ limit: '100' })),
  });

  const { data: preselectedPolicy } = useQuery({
    queryKey: ['policy', policySlug],
    queryFn: () => fetchPolicyBySlug(policySlug!),
    enabled: !!policySlug,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateContributionDto>({
    resolver: zodResolver(CreateContributionSchema),
    defaultValues: {
      type: ContributionType.TESTIMONY,
      content: '',
      location: '',
    },
  });

  useEffect(() => {
    if (preselectedPolicy?.id) {
      setPolicyId(preselectedPolicy.id);
      setValue('policyId', preselectedPolicy.id);
    }
  }, [preselectedPolicy, setValue]);

  const mutation = useMutation({
    mutationFn: (formData: FormData) => createContribution(formData),
    onSuccess: () => {
      setValue('content', '');
      setValue('location', '');
    },
  });

  const policies = policiesData?.data ?? [];
  const selectedPolicyId = watch('policyId');

  const onSubmit = (dto: CreateContributionDto) => {
    const formData = new FormData();
    formData.append('policyId', dto.policyId);
    formData.append('type', dto.type);
    formData.append('content', dto.content);
    if (dto.location) formData.append('location', dto.location);
    if (dto.region) formData.append('region', dto.region);
    const fileInput = document.getElementById('contribution-file') as HTMLInputElement;
    if (fileInput?.files?.[0]) formData.append('file', fileInput.files[0]);
    mutation.mutate(formData);
  };

  return (
    <main id="main-content" className="min-h-screen bg-muted/20">
      <div className="border-b bg-civic-black py-12">
        <div className="container">
          <h1 className="text-3xl font-bold text-white md:text-4xl">{t('title')}</h1>
          <p className="mt-2 text-gray-300">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            {mutation.isSuccess && (
              <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-700 dark:text-green-400" role="alert">
                {t('success')}
              </div>
            )}
            {mutation.isError && (
              <p className="mb-4 text-sm text-destructive" role="alert">
                {(mutation.error as Error).message}
              </p>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="policyId" className="text-sm font-medium mb-1.5 block">
                  {t('policyLabel')}
                </label>
                {loadingPolicies ? (
                  <Skeleton className="h-10 w-full rounded-md" />
                ) : (
                  <select
                    id="policyId"
                    {...register('policyId')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red"
                    value={selectedPolicyId ?? policyId ?? ''}
                    onChange={(e) => {
                      setValue('policyId', e.target.value);
                      setPolicyId(e.target.value || null);
                    }}
                  >
                    <option value="">Choisir une politique</option>
                    {policies.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                )}
                {errors.policyId && (
                  <p className="mt-1 text-xs text-destructive">{errors.policyId.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('type')}</label>
                <div className="flex flex-wrap gap-2">
                  {CONTRIBUTION_TYPES.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={type}
                        {...register('type')}
                        className="rounded-full border-input text-civic-red focus:ring-civic-red"
                      />
                      <span className="text-sm">{t(type)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="content" className="text-sm font-medium mb-1.5 block">
                  {t('content')}
                </label>
                <textarea
                  id="content"
                  rows={5}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red"
                  placeholder={t('contentPlaceholder')}
                  {...register('content')}
                />
                {errors.content && (
                  <p className="mt-1 text-xs text-destructive">{errors.content.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="location" className="text-sm font-medium mb-1.5 block">
                  {t('location')}
                </label>
                <Input
                  id="location"
                  placeholder="Ex: Dakar, Thiès..."
                  {...register('location')}
                  error={errors.location?.message}
                />
              </div>

              <div>
                <label htmlFor="contribution-file" className="text-sm font-medium mb-1.5 block">
                  {t('file')}
                </label>
                <input
                  id="contribution-file"
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/webp"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-4 file:rounded file:border-0 file:bg-civic-red file:px-4 file:py-2 file:text-sm file:text-white file:font-medium"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={mutation.isPending}
              >
                {mutation.isPending ? t('submitting') : t('submit')}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link href="/policies" className="text-civic-red hover:underline">
                Voir les politiques publiques
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DashboardStats } from '@/components/features/dashboard/DashboardStats';
import { CompletionChart } from '@/components/charts/CompletionChart';
import { MinistryBarChart } from '@/components/charts/MinistryBarChart';
import { RealtimeFeed } from '@/components/features/dashboard/RealtimeFeed';
import { Skeleton } from '@xamle/ui';

export const metadata: Metadata = {
  title: 'Tableau de bord citoyen',
  description: 'Vue d\'ensemble des politiques publiques sénégalaises en temps réel.',
};

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b bg-background py-8">
        <div className="container">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        <Suspense fallback={<DashboardStatsSkeleton />}>
          <DashboardStats />
        </Suspense>

        <div className="grid gap-6 lg:grid-cols-2">
          <Suspense fallback={<Skeleton className="h-72 rounded-xl" />}>
            <CompletionChart />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-72 rounded-xl" />}>
            <MinistryBarChart />
          </Suspense>
        </div>

        <Suspense fallback={<Skeleton className="h-48 rounded-xl" />}>
          <RealtimeFeed />
        </Suspense>
      </div>
    </div>
  );
}

function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
    </div>
  );
}

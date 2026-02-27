import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Skeleton } from '@xamle/ui';
import { AnalyticsDashboard } from '@/components/features/dashboard/AnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Analytiques avancées — Xamle Civic',
  description: 'Filtres croisés, comparaisons et export de données sur les politiques publiques sénégalaises.',
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord analytique</h1>
        <p className="text-muted-foreground mt-1">
          Filtres croisés, comparaisons de politiques et exports de données.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <AnalyticsDashboard />
      </Suspense>
    </div>
  );
}

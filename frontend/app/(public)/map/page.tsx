import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Skeleton } from '@xamle/ui';
import { SenegalMapWrapper } from '@/components/maps/SenegalMapWrapper';

export const metadata: Metadata = {
  title: 'Carte interactive — Xamle Civic',
  description: 'Visualisez les politiques publiques par région et département du Sénégal.',
};

export default function MapPage() {
  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Carte interactive du Sénégal</h1>
        <p className="text-muted-foreground mt-1">
          Politiques publiques par région — intensité des interventions et taux de réalisation.
        </p>
      </div>
      <Suspense
        fallback={
          <Skeleton className="w-full rounded-xl" style={{ height: 560 }} />
        }
      >
        <SenegalMapWrapper />
      </Suspense>
    </div>
  );
}

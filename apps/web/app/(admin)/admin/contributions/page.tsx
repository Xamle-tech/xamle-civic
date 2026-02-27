import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AdminContributionsTable } from '@/components/features/admin/AdminContributionsTable';
import { Skeleton } from '@xamle/ui';

export const metadata: Metadata = {
  title: 'Modération des contributions — Xamle Admin',
};

export default function AdminContributionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contributions citoyennes</h1>
        <p className="text-muted-foreground mt-1">
          Validez ou rejetez les signalements et témoignages en attente de modération.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <AdminContributionsTable />
      </Suspense>
    </div>
  );
}

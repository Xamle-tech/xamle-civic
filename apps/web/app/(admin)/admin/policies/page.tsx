import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AdminPoliciesTable } from '@/components/features/admin/AdminPoliciesTable';
import { Skeleton } from '@xamle/ui';

export const metadata: Metadata = {
  title: 'Gestion des politiques — Xamle Admin',
};

export default function AdminPoliciesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Politiques publiques</h1>
          <p className="text-muted-foreground mt-1">
            Gérez, publiez et archivez les fiches politiques.
          </p>
        </div>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <AdminPoliciesTable />
      </Suspense>
    </div>
  );
}

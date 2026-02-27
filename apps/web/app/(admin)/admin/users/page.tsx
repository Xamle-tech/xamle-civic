import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AdminUsersTable } from '@/components/features/admin/AdminUsersTable';
import { Skeleton } from '@xamle/ui';

export const metadata: Metadata = {
  title: 'Gestion des utilisateurs — Xamle Admin',
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
        <p className="text-muted-foreground mt-1">
          Modérez les comptes, gérez les rôles et les blocages.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <AdminUsersTable />
      </Suspense>
    </div>
  );
}

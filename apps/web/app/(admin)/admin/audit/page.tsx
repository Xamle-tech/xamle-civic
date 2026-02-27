import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuditLogTable } from '@/components/features/admin/AuditLogTable';
import { Skeleton } from '@xamle/ui';

export const metadata: Metadata = {
  title: 'Journal d\'audit — Xamle Admin',
};

export default function AdminAuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Journal d'audit</h1>
        <p className="text-muted-foreground mt-1">
          Historique immuable de toutes les actions administratives et modifications de statut.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <AuditLogTable />
      </Suspense>
    </div>
  );
}

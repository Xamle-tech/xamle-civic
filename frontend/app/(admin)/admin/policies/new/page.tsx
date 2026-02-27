import type { Metadata } from 'next';
import { PolicyForm } from '@/components/features/admin/PolicyForm';

export const metadata: Metadata = {
  title: 'Nouvelle politique — Xamle Admin',
};

export default function NewPolicyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nouvelle politique publique</h1>
        <p className="text-muted-foreground mt-1">
          Créez une nouvelle fiche de politique publique à suivre.
        </p>
      </div>

      <PolicyForm mode="create" />
    </div>
  );
}

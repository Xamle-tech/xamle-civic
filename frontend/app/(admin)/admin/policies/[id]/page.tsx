import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PolicyForm } from '@/components/features/admin/PolicyForm';

// Server-side data fetching
async function getPolicy(id: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${API_URL}/api/v1/policies/${id}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) return null;
    
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const policy = await getPolicy(params.id);
  
  return {
    title: policy ? `Éditer ${policy.title} — Xamle Admin` : 'Politique introuvable',
  };
}

export default async function EditPolicyPage({ params }: { params: { id: string } }) {
  const policy = await getPolicy(params.id);
  
  if (!policy) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Éditer la politique</h1>
        <p className="text-muted-foreground mt-1">
          Modifiez les informations de la politique publique.
        </p>
      </div>

      <PolicyForm mode="edit" policy={policy} />
    </div>
  );
}

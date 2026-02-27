import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PolicyList } from '@/components/features/policies/PolicyList';
import { FilterPanel } from '@/components/features/policies/FilterPanel';
import { Skeleton } from '@xamle/ui';

export const metadata: Metadata = {
  title: 'Politiques publiques',
  description: 'Explorez et suivez toutes les politiques publiques du Sénégal.',
};

export default async function PoliciesPage() {
  const t = await getTranslations('policies');

  return (
    <main id="main-content" className="min-h-screen">
      <div className="border-b bg-civic-black py-12">
        <div className="container">
          <h1 className="text-3xl font-bold text-white md:text-4xl">{t('title')}</h1>
          <p className="mt-2 text-gray-300">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full lg:w-72 shrink-0" aria-label="Filtres">
            <FilterPanel />
          </aside>

          <div className="flex-1 min-w-0">
            <Suspense fallback={<PolicyListSkeleton />}>
              <PolicyList />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}

function PolicyListSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-xl" />
      ))}
    </div>
  );
}

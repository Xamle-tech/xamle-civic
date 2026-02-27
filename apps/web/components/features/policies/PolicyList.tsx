'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useFilterStore } from '@/stores/filterStore';
import { fetchPolicies } from '@/lib/api';
import { PolicyCard } from './PolicyCard';
import { Skeleton } from '@xamle/ui';
import { Button } from '@xamle/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function PolicyList() {
  const t = useTranslations('policies');
  const { toSearchParams, page, setPage } = useFilterStore();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['policies', toSearchParams().toString()],
    queryFn: () => fetchPolicies(toSearchParams()),
    placeholderData: (prev) => prev,
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-destructive">{t('noResults')}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center">
        <p className="text-lg font-medium">{t('noResults')}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Modifiez vos filtres pour obtenir des résultats.
        </p>
      </div>
    );
  }

  const { meta } = data;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {meta.total} politique{meta.total > 1 ? 's' : ''} trouvée{meta.total > 1 ? 's' : ''}
      </p>

      <div className="grid gap-6 sm:grid-cols-2" role="list" aria-label="Liste des politiques">
        {data.data.map((policy, i) => (
          <div key={policy.id} role="listitem">
            <PolicyCard policy={policy} index={i} />
          </div>
        ))}
      </div>

      {meta.totalPages > 1 && (
        <nav
          className="flex items-center justify-between border-t pt-4"
          aria-label="Pagination"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={!meta.hasPrev}
            aria-label="Page précédente"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground" aria-current="page">
            Page {meta.page} sur {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={!meta.hasNext}
            aria-label="Page suivante"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      )}
    </div>
  );
}

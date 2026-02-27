'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Badge, Button, StatusBadge, Skeleton, Card } from '@xamle/ui';
import { PolicyStatus } from '@xamle/types';
import { Plus, Pencil, Trash2, RefreshCw, Download } from 'lucide-react';
import Link from 'next/link';
import type { Policy } from '@xamle/types';

type PoliciesResponse = { data: Policy[]; total: number; page: number; limit: number };

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: 'Non démarré', IN_PROGRESS: 'En cours', DELAYED: 'En retard',
  COMPLETED: 'Achevé', ABANDONED: 'Abandonné', REFORMULATED: 'Reformulé',
};

const THEME_LABELS: Record<string, string> = {
  HEALTH: 'Santé', EDUCATION: 'Éducation', INFRASTRUCTURE: 'Infrastructure',
  AGRICULTURE: 'Agriculture', JUSTICE: 'Justice', SECURITY: 'Sécurité',
  DIGITAL: 'Numérique', ENVIRONMENT: 'Environnement', OTHER: 'Autre',
};

const STATUS_OPTIONS = Object.keys(STATUS_LABELS);

export function AdminPoliciesTable() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching } = useQuery<PoliciesResponse>({
    queryKey: ['admin-policies', page, statusFilter, search],
    queryFn: () =>
      api.get('/policies', {
        page, limit: 20,
        ...(statusFilter && { status: statusFilter }),
        ...(search && { search }),
      }),
  });

  const policies = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const handleExport = async () => {
    const csv = [
      ['Titre', 'Ministère', 'Statut', 'Thème', 'Budget', 'Date début', 'Date fin'],
      ...policies.map((p) => [
        p.title,
        p.ministry?.name ?? '',
        STATUS_LABELS[p.status] ?? p.status,
        THEME_LABELS[p.theme] ?? p.theme,
        p.budget?.toString() ?? '',
        p.startDate ?? '',
        p.endDate ?? '',
      ]),
    ].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `politiques-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <Card>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
        <input
          type="search"
          placeholder="Rechercher une politique…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-civic-red"
          aria-label="Rechercher une politique"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-civic-red"
          aria-label="Filtrer par statut"
        >
          <option value="">Tous les statuts</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{total} politique{total > 1 ? 's' : ''}</span>
          {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />}
          <Button size="sm" variant="outline" onClick={handleExport} aria-label="Exporter en CSV">
            <Download className="h-4 w-4 mr-1.5" aria-hidden="true" />CSV
          </Button>
          <Link href="/admin/policies/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />Nouvelle politique
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="Liste des politiques publiques">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
              <th scope="col" className="px-4 py-3 text-left font-medium">Titre</th>
              <th scope="col" className="px-4 py-3 text-left font-medium hidden md:table-cell">Ministère</th>
              <th scope="col" className="px-4 py-3 text-left font-medium">Statut</th>
              <th scope="col" className="px-4 py-3 text-left font-medium hidden lg:table-cell">Thème</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  Aucune politique trouvée.
                </td>
              </tr>
            )}
            {policies.map((policy) => (
              <tr key={policy.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/policies/${policy.slug}`}
                    target="_blank"
                    className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red rounded"
                  >
                    {policy.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                  {policy.ministry?.name ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={policy.status as PolicyStatus} />
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell text-xs">
                  {policy.theme}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/policies/${policy.id}`} aria-label={`Modifier ${policy.title}`}>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <Button
            variant="outline" size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Page précédente"
          >
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="outline" size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Page suivante"
          >
            Suivant
          </Button>
        </div>
      )}
    </Card>
  );
}

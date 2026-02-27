'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Badge, Button, Card, Skeleton } from '@xamle/ui';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle, FileText, Link as LinkIcon, Image } from 'lucide-react';

type Contribution = {
  id: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  policy: { title: string; slug: string };
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  TESTIMONY: <AlertTriangle className="h-4 w-4 text-orange-500" aria-hidden="true" />,
  DOCUMENT: <FileText className="h-4 w-4 text-blue-500" aria-hidden="true" />,
  LINK: <LinkIcon className="h-4 w-4 text-purple-500" aria-hidden="true" />,
  PHOTO: <Image className="h-4 w-4 text-green-500" aria-hidden="true" />,
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
  APPROVED: 'bg-green-500/10 text-green-600 border-green-500/30',
  REJECTED: 'bg-red-500/10 text-red-600 border-red-500/30',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente', APPROVED: 'Approuvée', REJECTED: 'Rejetée',
};

export function AdminContributionsTable() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  const { data, isLoading, isFetching } = useQuery<{ data: Contribution[]; total: number }>({
    queryKey: ['admin-contributions', page, statusFilter],
    queryFn: () => api.get('/contributions/admin/list', { page, limit: 20, status: statusFilter }),
  });

  const contributions = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const moderateMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      api.patch(`/contributions/${id}/moderate`, { action }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-contributions'] }),
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
        <div className="flex gap-1">
          {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red ${
                statusFilter === s ? 'bg-civic-red text-white' : 'border border-border text-muted-foreground hover:bg-muted'
              }`}
              aria-pressed={statusFilter === s}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{total} contribution{total > 1 ? 's' : ''}</span>
          {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </div>

      <div className="divide-y divide-border">
        {contributions.length === 0 && (
          <p className="py-12 text-center text-muted-foreground text-sm">Aucune contribution trouvée.</p>
        )}
        {contributions.map((c) => (
          <div key={c.id} className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 hover:bg-muted/30 transition-colors">
            <div className="mt-0.5 flex-shrink-0">
              {TYPE_ICONS[c.type] ?? <AlertTriangle className="h-4 w-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[c.status] ?? ''}`}>
                  {STATUS_LABELS[c.status] ?? c.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  Par <strong>{c.user.name}</strong> · {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <p className="text-sm font-medium truncate" title={c.description}>{c.description}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Politique : <span className="text-foreground">{c.policy.title}</span>
              </p>
            </div>
            {c.status === 'PENDING' && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm" variant="outline"
                  className="text-green-600 border-green-500/30 hover:bg-green-500/10 h-8"
                  onClick={() => moderateMutation.mutate({ id: c.id, action: 'approve' })}
                  disabled={moderateMutation.isPending}
                  aria-label="Approuver la contribution"
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                  Approuver
                </Button>
                <Button
                  size="sm" variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10 h-8"
                  onClick={() => moderateMutation.mutate({ id: c.id, action: 'reject' })}
                  disabled={moderateMutation.isPending}
                  aria-label="Rejeter la contribution"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                  Rejeter
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Précédent</Button>
          <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Suivant</Button>
        </div>
      )}
    </Card>
  );
}

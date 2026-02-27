'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, Skeleton, Button } from '@xamle/ui';
import { RefreshCw, Download } from 'lucide-react';

type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: { name: string; email: string } | null;
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'text-green-600', UPDATE: 'text-blue-600',
  DELETE: 'text-red-600', STATUS_CHANGE: 'text-orange-600',
  LOGIN: 'text-purple-600', BLOCK: 'text-red-700',
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Création',
  UPDATE: 'Modification',
  DELETE: 'Suppression',
  STATUS_CHANGE: 'Changement de statut',
  LOGIN: 'Connexion',
  BLOCK: 'Blocage',
};

const AUDIT_ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'LOGIN', 'BLOCK'] as const;

export function AuditLogTable() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  const { data, isLoading, isFetching } = useQuery<{ data: AuditLog[]; total: number }>({
    queryKey: ['audit-logs', page, actionFilter],
    queryFn: () => api.get('/admin/audit-logs', { page, limit: 50, action: actionFilter }),
  });

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 50);

  const handleExport = () => {
    const csv = [
      ['Date', 'Action', 'Entité', 'ID Entité', 'Utilisateur', 'Détails'],
      ...logs.map((l) => [
        new Date(l.createdAt).toLocaleString('fr-FR'),
        ACTION_LABELS[l.action] ?? l.action,
        l.entityType,
        l.entityId,
        l.user?.name ?? l.userId ?? 'Système',
        JSON.stringify(l.metadata ?? {}),
      ]),
    ].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
        <select
          value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-civic-red"
          aria-label="Filtrer par type d'action"
        >
          <option value="">Toutes les actions</option>
          {AUDIT_ACTIONS.map((a) => (
            <option key={a} value={a}>{ACTION_LABELS[a] ?? a}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{total} événement{total > 1 ? 's' : ''}</span>
          {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
          <Button size="sm" variant="outline" onClick={handleExport} aria-label="Exporter l'audit en CSV">
            <Download className="h-4 w-4 mr-1.5" />CSV
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="Journal d'audit">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
              <th scope="col" className="px-4 py-3 text-left font-medium">Date</th>
              <th scope="col" className="px-4 py-3 text-left font-medium">Action</th>
              <th scope="col" className="px-4 py-3 text-left font-medium hidden md:table-cell">Entité</th>
              <th scope="col" className="px-4 py-3 text-left font-medium hidden lg:table-cell">Utilisateur</th>
              <th scope="col" className="px-4 py-3 text-left font-medium hidden xl:table-cell">Détails</th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            {logs.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground font-sans">Aucun événement trouvé.</td></tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString('fr-FR')}
                </td>
                <td className="px-4 py-2">
                  <span className={`font-semibold ${ACTION_COLORS[log.action] ?? 'text-foreground'}`}>
                    {ACTION_LABELS[log.action] ?? log.action}
                  </span>
                </td>
                <td className="px-4 py-2 text-muted-foreground hidden md:table-cell">
                  <span className="font-medium text-foreground">{log.entityType}</span>
                  <span className="text-muted-foreground ml-1 truncate max-w-24 block" title={log.entityId}>
                    {log.entityId.slice(0, 8)}…
                  </span>
                </td>
                <td className="px-4 py-2 text-muted-foreground hidden lg:table-cell">
                  {log.user?.name ?? log.userId ?? 'Système'}
                </td>
                <td className="px-4 py-2 text-muted-foreground hidden xl:table-cell max-w-xs truncate" title={JSON.stringify(log.metadata)}>
                  {log.metadata ? JSON.stringify(log.metadata).slice(0, 60) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

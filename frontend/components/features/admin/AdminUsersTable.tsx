'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Badge, Button, Card, Skeleton } from '@xamle/ui';
import { UserRole } from '@xamle/types';
import { RefreshCw, Download, ShieldOff, Shield } from 'lucide-react';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  level: string;
  isBlocked: boolean;
  createdAt: string;
  _count: { contributions: number; comments: number };
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super administrateur', ADMIN: 'Administrateur', MODERATOR: 'Modérateur',
  EDITOR: 'Éditeur', CONTRIBUTOR: 'Contributeur', VISITOR: 'Visiteur',
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-civic-red/10 text-civic-red border-civic-red/30',
  ADMIN: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  MODERATOR: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  EDITOR: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  CONTRIBUTOR: 'bg-green-500/10 text-green-500 border-green-500/30',
  VISITOR: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
};

export function AdminUsersTable() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading, isFetching } = useQuery<{ data: AdminUser[]; total: number }>({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: () => api.get('/users/admin/list', { page, limit: 20, search, role: roleFilter }),
  });

  const users = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const blockMutation = useMutation({
    mutationFn: ({ id, block }: { id: string; block: boolean }) =>
      api.patch(`/users/${id}/block`, { isBlocked: block }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const handleExport = () => {
    const csv = [
      ['Nom', 'Email', 'Rôle', 'Niveau', 'Contributions', 'Commentaires', 'Date inscription', 'Bloqué'],
      ...users.map((u) => [
        u.name, u.email, ROLE_LABELS[u.role] ?? u.role, u.level,
        u._count.contributions, u._count.comments,
        new Date(u.createdAt).toLocaleDateString('fr-FR'),
        u.isBlocked ? 'Oui' : 'Non',
      ]),
    ].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `utilisateurs-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
        <input
          type="search" placeholder="Rechercher un utilisateur…" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-civic-red"
          aria-label="Rechercher un utilisateur"
        />
        <select
          value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-civic-red"
          aria-label="Filtrer par rôle"
        >
          <option value="">Tous les rôles</option>
          {Object.keys(ROLE_LABELS).map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{total} utilisateur{total > 1 ? 's' : ''}</span>
          {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
          <Button size="sm" variant="outline" onClick={handleExport} aria-label="Exporter en CSV">
            <Download className="h-4 w-4 mr-1.5" />CSV
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="Liste des utilisateurs">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
              <th scope="col" className="px-4 py-3 text-left font-medium">Utilisateur</th>
              <th scope="col" className="px-4 py-3 text-left font-medium hidden md:table-cell">Rôle</th>
              <th scope="col" className="px-4 py-3 text-left font-medium hidden lg:table-cell">Niveau</th>
              <th scope="col" className="px-4 py-3 text-center font-medium hidden lg:table-cell">Contributions</th>
              <th scope="col" className="px-4 py-3 text-left font-medium hidden md:table-cell">Inscrit le</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Aucun utilisateur trouvé.</td></tr>
            )}
            {users.map((user) => (
              <tr key={user.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${user.isBlocked ? 'opacity-60' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-civic-red/10 flex items-center justify-center text-xs font-bold text-civic-red flex-shrink-0" aria-hidden="true">
                      {user.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role] ?? ''}`}>
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{user.level}</td>
                <td className="px-4 py-3 text-center text-xs hidden lg:table-cell">
                  <span title={`${user._count.comments} commentaires`}>
                    {user._count.contributions}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost" size="sm"
                      className={`h-7 w-7 p-0 ${user.isBlocked ? 'text-green-600 hover:text-green-700' : 'text-destructive hover:text-destructive/80'}`}
                      onClick={() => blockMutation.mutate({ id: user.id, block: !user.isBlocked })}
                      disabled={blockMutation.isPending}
                      aria-label={user.isBlocked ? `Débloquer ${user.name}` : `Bloquer ${user.name}`}
                    >
                      {user.isBlocked ? <Shield className="h-3.5 w-3.5" aria-hidden="true" /> : <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Page précédente">Précédent</Button>
          <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Page suivante">Suivant</Button>
        </div>
      )}
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card, Button, Skeleton, Badge } from '@xamle/ui';
import { Download, Filter } from 'lucide-react';

const COLORS = ['#C0392B', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#16a085'];
const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: 'Non démarré', IN_PROGRESS: 'En cours', DELAYED: 'En retard',
  COMPLETED: 'Achevé', ABANDONED: 'Abandonné', REFORMULATED: 'Reformulé',
};
const THEMES = ['Santé', 'Éducation', 'Infrastructure', 'Agriculture', 'Numérique', 'Environnement', 'Justice', 'Sécurité'];
const PERIODS = [
  { value: '3m', label: '3 mois' }, { value: '6m', label: '6 mois' },
  { value: '1y', label: '1 an' }, { value: 'all', label: 'Tout' },
];

type AnalyticsData = {
  byStatus: { status: string; count: number }[];
  byTheme: { theme: string; total: number; completed: number; rate: number }[];
  byMinistry: { name: string; total: number; rate: number }[];
  trend: { month: string; rate: number; count: number }[];
  budgetSummary: { allocated: number; spent: number; theme: string }[];
};

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState('1y');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState('');

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics', period, selectedTheme, selectedMinistry],
    queryFn: () =>
      api.get('/policies/analytics', {
        period,
        ...(selectedTheme && { theme: selectedTheme }),
        ...(selectedMinistry && { ministry: selectedMinistry }),
      }),
    staleTime: 5 * 60 * 1000,
  });

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ['=== Répartition par statut ==='],
      ['Statut', 'Nombre'],
      ...(data.byStatus?.map((d) => [STATUS_LABELS[d.status] ?? d.status, d.count]) ?? []),
      [],
      ['=== Taux de réalisation par thème ==='],
      ['Thème', 'Total', 'Achevées', 'Taux %'],
      ...(data.byTheme?.map((d) => [d.theme, d.total, d.completed, d.rate]) ?? []),
      [],
      ['=== Performance par ministère ==='],
      ['Ministère', 'Politiques', 'Taux %'],
      ...(data.byMinistry?.map((d) => [d.name, d.total, d.rate]) ?? []),
    ];
    const csv = rows.map((row) =>
      Array.isArray(row) && row.length
        ? row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        : ''
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `analytiques-${period}-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
          <div className="flex gap-1" role="group" aria-label="Période">
            {PERIODS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red ${
                  period === value ? 'bg-civic-red text-white' : 'border border-border text-muted-foreground hover:bg-muted'
                }`}
                aria-pressed={period === value}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            value={selectedTheme} onChange={(e) => setSelectedTheme(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-civic-red"
            aria-label="Filtrer par thème"
          >
            <option value="">Tous les thèmes</option>
            {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="ml-auto">
            <Button size="sm" variant="outline" onClick={handleExportCSV} disabled={!data} aria-label="Exporter les données analytiques en CSV">
              <Download className="h-4 w-4 mr-1.5" aria-hidden="true" />Exporter CSV
            </Button>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status distribution pie */}
          <Card className="p-5">
            <h2 className="font-semibold mb-4 text-sm">Répartition par statut</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data?.byStatus?.map((d) => ({ ...d, name: STATUS_LABELS[d.status] ?? d.status }))}
                  dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {data?.byStatus?.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} politique${v > 1 ? 's' : ''}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Trend line chart */}
          <Card className="p-5">
            <h2 className="font-semibold mb-4 text-sm">Évolution du taux de réalisation</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data?.trend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Taux de réalisation']} />
                <Line type="monotone" dataKey="rate" stroke="#C0392B" strokeWidth={2} dot={false} name="Taux %" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Theme bar chart */}
          <Card className="p-5">
            <h2 className="font-semibold mb-4 text-sm">Performance par thème</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data?.byTheme} margin={{ top: 5, right: 10, bottom: 30, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="theme" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
                <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Taux']} />
                <Bar dataKey="rate" fill="#C0392B" radius={[4, 4, 0, 0]} name="Taux de réalisation" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Ministry radar chart */}
          <Card className="p-5">
            <h2 className="font-semibold mb-4 text-sm">Radar de performance — Ministères</h2>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={data?.byMinistry?.slice(0, 8).map((m) => ({ ...m, fullMark: 100 }))}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                <Radar name="Taux %" dataKey="rate" stroke="#C0392B" fill="#C0392B" fillOpacity={0.25} />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Taux de réalisation']} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          {/* Budget comparison */}
          {data?.budgetSummary && data.budgetSummary.length > 0 && (
            <Card className="p-5 lg:col-span-2">
              <h2 className="font-semibold mb-4 text-sm">Budget alloué vs réalisé par thème (FCFA)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.budgetSummary} margin={{ top: 5, right: 10, bottom: 30, left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="theme" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
                  <YAxis tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(0)}M`} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [`${(v / 1_000_000).toFixed(1)} M FCFA`, '']} />
                  <Legend />
                  <Bar dataKey="allocated" fill="#1A252F" radius={[4, 4, 0, 0]} name="Alloué" />
                  <Bar dataKey="spent" fill="#C0392B" radius={[4, 4, 0, 0]} name="Réalisé" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

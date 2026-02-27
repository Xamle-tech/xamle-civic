'use client';

import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@xamle/ui';
import { fetchGlobalStats } from '@/lib/api';
import { PolicyStatus } from '@xamle/types';

const STATUS_COLORS: Record<string, string> = {
  [PolicyStatus.COMPLETED]: '#22c55e',
  [PolicyStatus.IN_PROGRESS]: '#3b82f6',
  [PolicyStatus.DELAYED]: '#f59e0b',
  [PolicyStatus.NOT_STARTED]: '#9ca3af',
  [PolicyStatus.ABANDONED]: '#ef4444',
  [PolicyStatus.REFORMULATED]: '#8b5cf6',
};

const STATUS_LABELS: Record<string, string> = {
  [PolicyStatus.COMPLETED]: 'Achevées',
  [PolicyStatus.IN_PROGRESS]: 'En cours',
  [PolicyStatus.DELAYED]: 'En retard',
  [PolicyStatus.NOT_STARTED]: 'Non démarrées',
  [PolicyStatus.ABANDONED]: 'Abandonnées',
  [PolicyStatus.REFORMULATED]: 'Reformulées',
};

export function MinistryBarChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['global-stats'],
    queryFn: fetchGlobalStats,
  });

  if (isLoading || !data) return null;

  const chartData = [
    { name: STATUS_LABELS[PolicyStatus.COMPLETED], value: data.completedPolicies, status: PolicyStatus.COMPLETED },
    { name: STATUS_LABELS[PolicyStatus.IN_PROGRESS], value: data.inProgressPolicies, status: PolicyStatus.IN_PROGRESS },
    { name: STATUS_LABELS[PolicyStatus.DELAYED], value: data.delayedPolicies, status: PolicyStatus.DELAYED },
    {
      name: STATUS_LABELS[PolicyStatus.NOT_STARTED],
      value: data.totalPolicies - data.completedPolicies - data.inProgressPolicies - data.delayedPolicies,
      status: PolicyStatus.NOT_STARTED,
    },
  ].filter((d) => d.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition par statut</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={STATUS_COLORS[entry.status]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number, n: string) => [v, n]} contentStyle={{ fontSize: 12 }} />
            <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

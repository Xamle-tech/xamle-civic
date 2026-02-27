'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@xamle/ui';
import { fetchMinistryRanking } from '@/lib/api';

const COLORS = ['#C0392B', '#e74c3c', '#c0392b99', '#c0392b66', '#c0392b33'];

export function CompletionChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['ministry-ranking'],
    queryFn: fetchMinistryRanking,
  });

  if (isLoading || !data) return null;

  const chartData = data.slice(0, 8).map((d) => ({
    name: d.ministry.name.replace('Ministère de ', '').replace("Ministère de l'", '').slice(0, 20),
    taux: d.completionRate,
    total: d.totalPolicies,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Taux de réalisation par ministère</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
            <Tooltip
              formatter={(v: number) => [`${v}%`, 'Taux de réalisation']}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="taux" radius={[4, 4, 0, 0]} name="Taux de réalisation">
              {chartData.map((_, i) => (
                <Cell key={i} fill={i === 0 ? '#C0392B' : '#1A252F'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

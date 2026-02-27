'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { fetchGlobalStats } from '@/lib/api';
import { Card, CardContent, Skeleton, formatCurrency } from '@xamle/ui';
import { TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export function DashboardStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['global-stats'],
    queryFn: fetchGlobalStats,
    refetchInterval: 60_000,
  });

  const cards = [
    {
      icon: TrendingUp,
      label: 'Politiques suivies',
      value: data?.totalPolicies ?? 0,
      sub: `${data?.globalCompletionRate ?? 0}% de taux de réalisation`,
      color: 'text-civic-red',
    },
    {
      icon: CheckCircle,
      label: 'Politiques achevées',
      value: data?.completedPolicies ?? 0,
      sub: 'Engagements honorés',
      color: 'text-green-600',
    },
    {
      icon: Clock,
      label: 'En cours',
      value: data?.inProgressPolicies ?? 0,
      sub: 'Politiques actives',
      color: 'text-blue-600',
    },
    {
      icon: AlertTriangle,
      label: 'En retard',
      value: data?.delayedPolicies ?? 0,
      sub: 'Nécessitent attention',
      color: 'text-amber-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list" aria-label="Statistiques globales">
      {cards.map(({ icon: Icon, label, value, sub, color }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08, duration: 0.35 }}
          role="listitem"
        >
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
              </div>
              <p className={`text-3xl font-bold tabular-nums ${color}`} aria-label={`${label}: ${value}`}>
                {value.toLocaleString('fr-FR')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

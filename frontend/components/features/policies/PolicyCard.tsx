'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, Badge, StatusBadge, Progress } from '@xamle/ui';
import { formatCurrency, computeProgress } from '@xamle/ui';
import { Policy } from '@xamle/types';
import { Calendar, Building2, MessageSquare, Users } from 'lucide-react';

interface PolicyCardProps {
  policy: Policy;
  index?: number;
}

const THEME_LABELS: Record<string, string> = {
  HEALTH: 'Santé',
  EDUCATION: 'Éducation',
  INFRASTRUCTURE: 'Infrastructure',
  AGRICULTURE: 'Agriculture',
  JUSTICE: 'Justice',
  SECURITY: 'Sécurité',
  DIGITAL: 'Numérique',
  ENVIRONMENT: 'Environnement',
  OTHER: 'Autre',
};

export function PolicyCard({ policy, index = 0 }: PolicyCardProps) {
  const progress = policy.budget && policy.budgetSpent
    ? computeProgress(Number(policy.budgetSpent), Number(policy.budget))
    : 0;

  const kpiProgress = policy.targetKpis?.length > 0
    ? Math.round(
        policy.targetKpis.reduce(
          (acc, kpi) => acc + computeProgress(kpi.current, kpi.target), 0
        ) / policy.targetKpis.length
      )
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/policies/${policy.slug}`} className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-civic-red rounded-xl">
        <Card className="h-full transition-shadow hover:shadow-md group-hover:border-civic-red/30">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <Badge variant="outline" className="text-xs shrink-0">
                {THEME_LABELS[policy.theme] ?? policy.theme}
              </Badge>
              <StatusBadge status={policy.status} />
            </div>

            <CardTitle className="mt-2 line-clamp-2 text-base leading-snug group-hover:text-civic-red transition-colors">
              {policy.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {policy.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {policy.description}
              </p>
            )}

            {policy.ministry && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="truncate">{policy.ministry.name}</span>
              </div>
            )}

            {kpiProgress !== null && (
              <Progress
                value={kpiProgress}
                label="Avancement KPIs"
                showValue
                aria-label={`Avancement: ${kpiProgress}%`}
              />
            )}

            {policy.budget && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Budget alloué</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(Number(policy.budget))}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-3">
              {policy._count && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                    {policy._count.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" aria-hidden="true" />
                    {policy._count.contributions}
                  </span>
                </div>
              )}
              {policy.updatedAt && (
                <time
                  dateTime={policy.updatedAt}
                  className="flex items-center gap-1 text-xs text-muted-foreground"
                >
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {new Date(policy.updatedAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </time>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.article>
  );
}

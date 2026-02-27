'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Card, CardContent, CardHeader, CardTitle,
  StatusBadge, Badge, Progress,
  formatCurrency, formatDate, computeProgress,
} from '@xamle/ui';
import { Policy } from '@xamle/types';
import {
  Building2, Calendar, TrendingUp, FileText, MessageSquare,
  Users, ExternalLink, ChevronRight, ArrowLeft,
} from 'lucide-react';
import { CommentSection } from '@/components/features/comments/CommentSection';
import { ContributionList } from '@/components/features/contributions/ContributionList';
import { PolicyTimeline } from './PolicyTimeline';

interface Props { policy: Policy; }

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
  { id: 'timeline', label: 'Chronologie', icon: Calendar },
  { id: 'sources', label: 'Sources', icon: FileText },
  { id: 'contributions', label: 'Contributions', icon: Users },
  { id: 'comments', label: 'Commentaires', icon: MessageSquare },
] as const;

type TabId = typeof TABS[number]['id'];

export function PolicyDetail({ policy }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const overallProgress = policy.targetKpis?.length
    ? Math.round(policy.targetKpis.reduce((a, k) => a + computeProgress(k.current, k.target), 0) / policy.targetKpis.length)
    : null;

  return (
    <div className="min-h-screen">
      <div className="bg-civic-black">
        <div className="container py-8">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <Link href="/policies" className="hover:text-white transition-colors">Politiques</Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span className="text-white truncate max-w-xs">{policy.title}</span>
          </nav>

          <div className="flex flex-wrap items-start gap-3 mb-4">
            <Badge variant="outline" className="border-white/20 text-gray-300">
              {policy.theme}
            </Badge>
            <StatusBadge status={policy.status} />
            {policy.region && (
              <Badge variant="outline" className="border-white/20 text-gray-300">
                {policy.region}
              </Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white md:text-3xl text-balance mb-2">
            {policy.title}
          </h1>

          {policy.ministry && (
            <div className="flex items-center gap-2 text-gray-300">
              <Building2 className="h-4 w-4 text-civic-red" aria-hidden="true" />
              <Link
                href={`/ministries/${policy.ministry.slug}`}
                className="hover:text-white transition-colors"
              >
                {policy.ministry.name}
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="border-b bg-background sticky top-0 z-10">
        <div className="container">
          <nav role="tablist" aria-label="Sections de la politique" className="flex overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                id={`tab-${id}`}
                aria-selected={activeTab === id}
                aria-controls={`panel-${id}`}
                onClick={() => setActiveTab(id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red focus-visible:ring-inset ${
                  activeTab === id
                    ? 'border-civic-red text-civic-red'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="container py-8">
        {activeTab === 'overview' && (
          <div
            role="tabpanel"
            id="panel-overview"
            aria-labelledby="tab-overview"
            className="space-y-6"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Avancement global"
                value={overallProgress !== null ? `${overallProgress}%` : 'N/A'}
                sub={policy.status}
              />
              {policy.budget && (
                <StatCard label="Budget alloué" value={formatCurrency(Number(policy.budget))} />
              )}
              {policy.budgetSpent && policy.budget && (
                <StatCard
                  label="Taux d'exécution budgétaire"
                  value={`${computeProgress(Number(policy.budgetSpent), Number(policy.budget))}%`}
                  sub={`${formatCurrency(Number(policy.budgetSpent))} dépensés`}
                />
              )}
              {policy.endDate && (
                <StatCard label="Échéance" value={formatDate(policy.endDate)} />
              )}
            </div>

            <Card>
              <CardHeader><CardTitle>Description</CardTitle></CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{policy.description}</p>
              </CardContent>
            </Card>

            {policy.targetKpis?.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Indicateurs de performance</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {policy.targetKpis.map((kpi, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{kpi.name}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {kpi.current.toLocaleString('fr-FR')} / {kpi.target.toLocaleString('fr-FR')} {kpi.unit}
                        </span>
                      </div>
                      <Progress
                        value={computeProgress(kpi.current, kpi.target)}
                        showValue
                        aria-label={`${kpi.name}: ${computeProgress(kpi.current, kpi.target)}%`}
                      />
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            )}

            {policy.indicators && policy.indicators.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Indicateurs mesurés</CardTitle></CardHeader>
                <CardContent>
                  <div className="divide-y">
                    {policy.indicators.map((ind) => (
                      <div key={ind.id} className="flex items-center justify-between py-3 text-sm">
                        <span>{ind.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium tabular-nums">
                            {ind.currentValue.toLocaleString('fr-FR')} {ind.unit}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            / {ind.targetValue.toLocaleString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div role="tabpanel" id="panel-timeline" aria-labelledby="tab-timeline">
            <PolicyTimeline history={policy.statusHistory ?? []} />
          </div>
        )}

        {activeTab === 'sources' && (
          <div role="tabpanel" id="panel-sources" aria-labelledby="tab-sources">
            <Card>
              <CardHeader>
                <CardTitle>Sources et preuves</CardTitle>
              </CardHeader>
              <CardContent>
                {!policy.sources?.length ? (
                  <p className="text-muted-foreground">Aucune source disponible.</p>
                ) : (
                  <ul className="space-y-3">
                    {policy.sources.map((src) => (
                      <li key={src.id} className="flex items-start gap-3 rounded-lg border p-3">
                        <Badge
                          variant={src.type === 'OFFICIAL' ? 'civic' : 'outline'}
                          className="shrink-0"
                        >
                          {src.type}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{src.title}</p>
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 flex items-center gap-1 text-xs text-civic-red hover:underline"
                          >
                            {src.url.slice(0, 60)}...
                            <ExternalLink className="h-3 w-3 shrink-0" aria-label="Ouvre dans un nouvel onglet" />
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'contributions' && (
          <div role="tabpanel" id="panel-contributions" aria-labelledby="tab-contributions">
            <ContributionList policyId={policy.id} policySlug={policy.slug} />
          </div>
        )}

        {activeTab === 'comments' && (
          <div role="tabpanel" id="panel-comments" aria-labelledby="tab-comments">
            <CommentSection policyId={policy.id} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-2xl font-bold text-civic-red tabular-nums">{value}</p>
        <p className="mt-1 text-sm font-medium">{label}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { useFilterStore } from '@/stores/filterStore';
import { PolicyStatus, PolicyTheme, SenegalRegion } from '@xamle/types';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@xamle/ui';
import { X } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: PolicyStatus.NOT_STARTED, labelKey: 'NOT_STARTED' },
  { value: PolicyStatus.IN_PROGRESS, labelKey: 'IN_PROGRESS' },
  { value: PolicyStatus.DELAYED, labelKey: 'DELAYED' },
  { value: PolicyStatus.COMPLETED, labelKey: 'COMPLETED' },
  { value: PolicyStatus.ABANDONED, labelKey: 'ABANDONED' },
  { value: PolicyStatus.REFORMULATED, labelKey: 'REFORMULATED' },
];

const THEME_OPTIONS = [
  { value: PolicyTheme.HEALTH, labelKey: 'HEALTH' },
  { value: PolicyTheme.EDUCATION, labelKey: 'EDUCATION' },
  { value: PolicyTheme.INFRASTRUCTURE, labelKey: 'INFRASTRUCTURE' },
  { value: PolicyTheme.AGRICULTURE, labelKey: 'AGRICULTURE' },
  { value: PolicyTheme.DIGITAL, labelKey: 'DIGITAL' },
  { value: PolicyTheme.ENVIRONMENT, labelKey: 'ENVIRONMENT' },
  { value: PolicyTheme.JUSTICE, labelKey: 'JUSTICE' },
  { value: PolicyTheme.SECURITY, labelKey: 'SECURITY' },
  { value: PolicyTheme.OTHER, labelKey: 'OTHER' },
];

export function FilterPanel() {
  const {
    search, setSearch,
    status, setStatus,
    theme, setTheme,
    region, setRegion,
    reset,
  } = useFilterStore();

  const tStatus = useTranslations('status');
  const tTheme = useTranslations('theme');
  const tRegion = useTranslations('region');

  const STATUS_OPTIONS_WITH_LABELS = STATUS_OPTIONS.map((o) => ({ ...o, label: tStatus(o.labelKey) }));
  const THEME_OPTIONS_WITH_LABELS = THEME_OPTIONS.map((o) => ({ ...o, label: tTheme(o.labelKey) }));
  const REGION_OPTIONS = Object.values(SenegalRegion).map((value) => ({
    value,
    label: tRegion(value),
  }));

  const hasFilters = !!(search || status || theme || region);

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Filtres
          </CardTitle>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              aria-label="Effacer tous les filtres"
              className="h-7 text-xs text-muted-foreground"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Effacer
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div>
          <label htmlFor="search-filter" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Recherche
          </label>
          <input
            id="search-filter"
            type="search"
            className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-civic-red"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <FilterGroup
          label="Statut"
          options={STATUS_OPTIONS_WITH_LABELS}
          selected={status}
          onSelect={(v) => setStatus(v === status ? undefined : v as PolicyStatus)}
        />

        <FilterGroup
          label="Thème"
          options={THEME_OPTIONS_WITH_LABELS}
          selected={theme}
          onSelect={(v) => setTheme(v === theme ? undefined : v as PolicyTheme)}
        />

        <div>
          <label htmlFor="region-filter" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Région
          </label>
          <select
            id="region-filter"
            className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-civic-red"
            value={region ?? ''}
            onChange={(e) => setRegion(e.target.value ? e.target.value as SenegalRegion : undefined)}
          >
            <option value="">Toutes les régions</option>
            {REGION_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: T | undefined;
  onSelect: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Filtrer par ${label}`}>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red ${
              selected === opt.value
                ? 'border-civic-red bg-civic-red text-white'
                : 'border-border hover:border-civic-red/50 hover:text-civic-red'
            }`}
            aria-pressed={selected === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { fetchPolicies } from '@/lib/api';
import { StatusBadge, formatDate } from '@xamle/ui';
import { ArrowRight } from 'lucide-react';

export function RecentUpdates() {
  const { data } = useQuery({
    queryKey: ['policies', 'recent'],
    queryFn: () => fetchPolicies(new URLSearchParams({ limit: '5', page: '1' })),
  });

  return (
    <div className="space-y-1 divide-y rounded-xl border bg-card overflow-hidden">
      {data?.data.map((policy) => (
        <Link
          key={policy.id}
          href={`/policies/${policy.slug}`}
          className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/50 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-civic-red"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate group-hover:text-civic-red transition-colors">
              {policy.title}
            </p>
            {policy.updatedAt && (
              <time dateTime={policy.updatedAt} className="text-xs text-muted-foreground">
                {formatDate(policy.updatedAt)}
              </time>
            )}
          </div>
          <StatusBadge status={policy.status} className="shrink-0" />
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-civic-red transition-colors" aria-hidden="true" />
        </Link>
      ))}
    </div>
  );
}

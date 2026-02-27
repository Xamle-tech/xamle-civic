'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { fetchMinistryRanking } from '@/lib/api';
import { Progress, Badge } from '@xamle/ui';
import { Trophy } from 'lucide-react';

export function MinistryRanking() {
  const { data } = useQuery({
    queryKey: ['ministry-ranking'],
    queryFn: fetchMinistryRanking,
  });

  return (
    <div className="space-y-3">
      {data?.slice(0, 5).map((item, i) => (
        <Link
          key={item.ministry.id}
          href={`/ministries/${item.ministry.slug}`}
          className="flex items-center gap-4 rounded-xl border bg-card p-4 hover:border-civic-red/30 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold shrink-0">
            {i === 0 ? <Trophy className="h-4 w-4 text-amber-500" aria-label="1er" /> : `${i + 1}`}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate group-hover:text-civic-red transition-colors">
              {item.ministry.name}
            </p>
            <Progress
              value={item.completionRate}
              className="mt-1.5"
              aria-label={`Taux de réalisation: ${item.completionRate}%`}
            />
          </div>
          <Badge variant="outline" className="shrink-0 tabular-nums">
            {item.completionRate}%
          </Badge>
        </Link>
      ))}
    </div>
  );
}

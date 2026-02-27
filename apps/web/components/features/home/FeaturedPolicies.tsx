'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPolicies } from '@/lib/api';
import { PolicyCard } from '@/components/features/policies/PolicyCard';
import { Button } from '@xamle/ui';
import Link from 'next/link';
import { PolicyStatus } from '@xamle/types';

export function FeaturedPolicies() {
  const { data } = useQuery({
    queryKey: ['policies', 'featured'],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '3', page: '1' });
      return fetchPolicies(params);
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data?.data.map((policy, i) => (
          <PolicyCard key={policy.id} policy={policy} index={i} />
        ))}
      </div>
      <div className="text-center">
        <Button variant="outline" asChild>
          <Link href="/policies">Voir toutes les politiques</Link>
        </Button>
      </div>
    </div>
  );
}

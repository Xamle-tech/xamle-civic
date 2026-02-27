'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { fetchContributions } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { Card, CardContent, Badge, Skeleton, Button } from '@xamle/ui';
import { MapPin, FileText, Camera, Link2, Plus } from 'lucide-react';
import { ContributionType } from '@xamle/types';
import Link from 'next/link';

const TYPE_ICONS = {
  [ContributionType.TESTIMONY]: FileText,
  [ContributionType.DOCUMENT]: FileText,
  [ContributionType.LINK]: Link2,
  [ContributionType.PHOTO]: Camera,
};

const TYPE_LABELS = {
  [ContributionType.TESTIMONY]: 'Témoignage',
  [ContributionType.DOCUMENT]: 'Document',
  [ContributionType.LINK]: 'Lien',
  [ContributionType.PHOTO]: 'Photo',
};

interface Props { policyId: string; policySlug: string; }

export function ContributionList({ policyId, policySlug }: Props) {
  const { isAuthenticated } = useUserStore();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['contributions', policyId, page],
    queryFn: () => fetchContributions(policyId, page),
  });

  if (isLoading) {
    return <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-28" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          Contributions citoyennes ({data?.meta.total ?? 0})
        </h3>
        {isAuthenticated() ? (
          <Link href={`/contribute?policy=${policySlug}`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Contribuer
            </Button>
          </Link>
        ) : (
          <Link href="/auth/login">
            <Button size="sm" variant="outline">Se connecter pour contribuer</Button>
          </Link>
        )}
      </div>

      {!data?.data.length ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Soyez le premier à contribuer sur cette politique.
          </CardContent>
        </Card>
      ) : (
        data.data.map((contrib) => {
          const Icon = TYPE_ICONS[contrib.type as ContributionType] ?? FileText;
          return (
            <Card key={contrib.id}>
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-civic-red" aria-hidden="true" />
                  <Badge variant="outline" className="text-xs">
                    {TYPE_LABELS[contrib.type as ContributionType]}
                  </Badge>
                  {contrib.region && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {contrib.region}
                    </span>
                  )}
                  <time dateTime={contrib.createdAt} className="ml-auto text-xs text-muted-foreground">
                    {new Date(contrib.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </time>
                </div>
                <p className="text-sm line-clamp-3">{contrib.content}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center font-medium" aria-hidden="true">
                    {contrib.user?.name?.[0]}
                  </div>
                  <span>{contrib.user?.name}</span>
                  <span aria-hidden="true">·</span>
                  <span>{contrib.user?.level}</span>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

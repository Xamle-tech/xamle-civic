import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { fetchPolicyBySlug } from '@/lib/api';
import { PolicyDetail } from '@/components/features/policies/PolicyDetail';
import { Skeleton } from '@xamle/ui';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const policy = await fetchPolicyBySlug(slug);
    return {
      title: policy.title,
      description: policy.description.slice(0, 160),
      openGraph: {
        title: `${policy.title} | Xamle Civic`,
        description: policy.description.slice(0, 160),
        type: 'article',
      },
    };
  } catch {
    return { title: 'Politique introuvable' };
  }
}

export default async function PolicyDetailPage({ params }: Props) {
  const { slug } = await params;

  let policy;
  try {
    policy = await fetchPolicyBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <main id="main-content">
      <Suspense fallback={<PolicyDetailSkeleton />}>
        <PolicyDetail policy={policy} />
      </Suspense>
    </main>
  );
}

function PolicyDetailSkeleton() {
  return (
    <div className="container py-8 space-y-6">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-6 w-1/3" />
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

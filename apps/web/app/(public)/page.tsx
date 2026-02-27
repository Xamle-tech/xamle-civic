import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { HeroSection } from '@/components/features/home/HeroSection';
import { StatsSection } from '@/components/features/home/StatsSection';
import { FeaturedPolicies } from '@/components/features/home/FeaturedPolicies';
import { MinistryRanking } from '@/components/features/home/MinistryRanking';
import { RecentUpdates } from '@/components/features/home/RecentUpdates';
import { Skeleton } from '@xamle/ui';

export default async function HomePage() {
  const t = await getTranslations('home');

  return (
    <main id="main-content">
      <HeroSection />

      <section aria-labelledby="stats-heading" className="py-12 bg-civic-black">
        <div className="container">
          <h2 id="stats-heading" className="sr-only">
            {t('stats.policies')}
          </h2>
          <Suspense fallback={<StatsSkeletons />}>
            <StatsSection />
          </Suspense>
        </div>
      </section>

      <section aria-labelledby="featured-heading" className="py-16">
        <div className="container">
          <h2 id="featured-heading" className="text-2xl font-bold text-civic-black mb-8">
            {t('sections.featured')}
          </h2>
          <Suspense fallback={<PolicySkeletons />}>
            <FeaturedPolicies />
          </Suspense>
        </div>
      </section>

      <section aria-labelledby="ministries-heading" className="py-16 bg-muted/50">
        <div className="container">
          <h2 id="ministries-heading" className="text-2xl font-bold text-civic-black mb-8">
            {t('sections.ministries')}
          </h2>
          <Suspense fallback={<MinistriesSkeletons />}>
            <MinistryRanking />
          </Suspense>
        </div>
      </section>

      <section aria-labelledby="updates-heading" className="py-16">
        <div className="container">
          <h2 id="updates-heading" className="text-2xl font-bold text-civic-black mb-8">
            {t('sections.latest')}
          </h2>
          <Suspense fallback={<PolicySkeletons />}>
            <RecentUpdates />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

function StatsSkeletons() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

function PolicySkeletons() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-xl" />
      ))}
    </div>
  );
}

function MinistriesSkeletons() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-xl" />
      ))}
    </div>
  );
}

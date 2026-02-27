'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { fetchGlobalStats } from '@/lib/api';

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayed.toLocaleString('fr-FR')}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  const t = useTranslations('home.stats');
  const { data, isLoading } = useQuery({
    queryKey: ['global-stats'],
    queryFn: fetchGlobalStats,
    staleTime: 5 * 60 * 1000,
  });

  const stats = [
    {
      key: 'policies',
      value: data?.totalPolicies ?? 0,
      label: t('policies'),
      suffix: '',
      color: 'text-white',
    },
    {
      key: 'rate',
      value: data?.globalCompletionRate ?? 0,
      label: t('completionRate'),
      suffix: '%',
      color: 'text-civic-red',
    },
    {
      key: 'contributions',
      value: data?.totalContributions ?? 0,
      label: t('contributions'),
      suffix: '',
      color: 'text-white',
    },
    {
      key: 'users',
      value: data?.totalUsers ?? 0,
      label: t('users'),
      suffix: '',
      color: 'text-white',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm"
        >
          <p className={`text-3xl font-bold md:text-4xl ${stat.color}`} aria-live="polite">
            {isLoading ? (
              <span className="inline-block h-8 w-16 animate-pulse rounded bg-white/10" />
            ) : (
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            )}
          </p>
          <p className="mt-2 text-sm text-gray-400">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from '@xamle/ui';
import { ArrowRight, MapPin, TrendingUp, Users } from 'lucide-react';

export function HeroSection() {
  const t = useTranslations('home.hero');

  return (
    <section
      className="relative overflow-hidden bg-civic-black hero-pattern py-20 md:py-32"
      aria-labelledby="hero-title"
    >
      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center rounded-full border border-civic-red/30 bg-civic-red/10 px-4 py-1.5 text-sm font-medium text-civic-red">
              <span className="mr-2 h-2 w-2 rounded-full bg-civic-red animate-pulse" />
              Plateforme citoyenne du Sénégal
            </div>

            <h1
              id="hero-title"
              className="mt-6 text-4xl font-bold tracking-tight text-white md:text-6xl text-balance"
            >
              {t('title')}
            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-300 text-balance">
              {t('subtitle')}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/policies">
                  {t('cta')}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="border-white/20 text-white hover:bg-white/10">
                <Link href="/contribute">{t('ctaSecondary')}</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-3 gap-6"
          >
            {[
              { icon: TrendingUp, label: 'Suivi en temps réel' },
              { icon: MapPin, label: '14 régions couvertes' },
              { icon: Users, label: 'Participation citoyenne' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 text-gray-400"
              >
                <Icon className="h-6 w-6 text-civic-red" aria-hidden="true" />
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-civic-black/50"
        aria-hidden="true"
      />
    </section>
  );
}

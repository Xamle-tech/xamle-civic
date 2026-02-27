'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@xamle/ui';

const SenegalMap = dynamic(() => import('./SenegalMap').then((m) => m.SenegalMap), {
  ssr: false,
  loading: () => <Skeleton className="w-full rounded-xl" style={{ height: 560 }} />,
});

export function SenegalMapWrapper() {
  return <SenegalMap />;
}

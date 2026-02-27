'use client';

import { motion } from 'framer-motion';
import { StatusHistory } from '@xamle/types';
import { StatusBadge, formatDate } from '@xamle/ui';

interface Props {
  history: StatusHistory[];
}

export function PolicyTimeline({ history }: Props) {
  if (!history.length) {
    return <p className="text-muted-foreground py-8 text-center">Aucun historique de statut disponible.</p>;
  }

  return (
    <div className="relative">
      <div
        className="absolute left-4 top-0 bottom-0 w-px bg-border md:left-1/2"
        aria-hidden="true"
      />
      <ol className="space-y-6" aria-label="Historique des statuts">
        {history.map((entry, i) => (
          <motion.li
            key={entry.id}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="relative pl-10 md:pl-0 md:grid md:grid-cols-2 md:gap-8"
          >
            <div
              className="absolute left-2.5 top-2 h-3 w-3 rounded-full border-2 border-background bg-civic-red md:left-1/2 md:-translate-x-1.5"
              aria-hidden="true"
            />
            <div className={`${i % 2 === 0 ? 'md:text-right md:pr-8' : 'md:col-start-2 md:pl-8'}`}>
              <time
                dateTime={entry.createdAt}
                className="text-xs text-muted-foreground"
              >
                {formatDate(entry.createdAt)}
              </time>
              <div className="mt-1 flex items-center gap-2 flex-wrap md:justify-end">
                {entry.fromStatus && (
                  <>
                    <StatusBadge status={entry.fromStatus} />
                    <span className="text-muted-foreground text-xs" aria-hidden="true">→</span>
                  </>
                )}
                <StatusBadge status={entry.toStatus} />
              </div>
              {entry.reason && (
                <p className="mt-1.5 text-sm text-muted-foreground">{entry.reason}</p>
              )}
              {entry.changedByUser && (
                <p className="mt-1 text-xs text-muted-foreground">
                  par {entry.changedByUser.name}
                </p>
              )}
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

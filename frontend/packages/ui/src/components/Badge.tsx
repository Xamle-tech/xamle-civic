import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn, statusColor } from '../lib/utils';
import { PolicyStatus } from '@xamle/types';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        civic: 'border-civic-red/30 bg-civic-red/10 text-civic-red',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

interface StatusBadgeProps {
  status: PolicyStatus;
  className?: string;
}

const STATUS_LABELS: Record<PolicyStatus, string> = {
  [PolicyStatus.NOT_STARTED]: 'Non démarré',
  [PolicyStatus.IN_PROGRESS]: 'En cours',
  [PolicyStatus.DELAYED]: 'En retard',
  [PolicyStatus.COMPLETED]: 'Achevé',
  [PolicyStatus.ABANDONED]: 'Abandonné',
  [PolicyStatus.REFORMULATED]: 'Reformulé',
};

function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        statusColor(status),
        className,
      )}
      aria-label={`Statut: ${STATUS_LABELS[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}

export { Badge, badgeVariants, StatusBadge, STATUS_LABELS };

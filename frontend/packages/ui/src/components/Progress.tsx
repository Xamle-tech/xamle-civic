import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '../lib/utils';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  label?: string;
  showValue?: boolean;
  colorClass?: string;
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value = 0, label, showValue = false, colorClass, ...props }, ref) => (
    <div className="space-y-1.5">
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && (
            <span className="font-medium tabular-nums" aria-live="polite">
              {value}%
            </span>
          )}
        </div>
      )}
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative h-2.5 w-full overflow-hidden rounded-full bg-secondary',
          className,
        )}
        aria-valuenow={value ?? 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full w-full flex-1 rounded-full transition-all duration-700 ease-out',
            colorClass ?? 'bg-civic-red',
          )}
          style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  ),
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

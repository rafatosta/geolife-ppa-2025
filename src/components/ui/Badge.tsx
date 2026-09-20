import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'success' | 'warning' | 'danger' | 'purple' | 'neutral';

export function Badge({ className, tone = 'neutral', ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        tone === 'success' && 'bg-success-soft text-success',
        tone === 'warning' && 'bg-warning-soft text-warning',
        tone === 'danger' && 'bg-danger-soft text-danger',
        tone === 'purple' && 'bg-[#eeeafd] text-commitment',
        tone === 'neutral' && 'bg-surface-muted text-ink-secondary',
        className,
      )}
      {...props}
    />
  );
}

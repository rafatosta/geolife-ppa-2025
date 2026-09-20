import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export function IconButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('inline-flex size-11 items-center justify-center rounded-full text-ink-secondary hover:bg-surface-muted', className)} {...props} />;
}

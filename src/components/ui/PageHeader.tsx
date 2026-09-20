import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-4 py-2">
      <div><h1 className="text-xl font-bold tracking-tight">{title}</h1>{subtitle && <p className="mt-0.5 text-sm text-ink-secondary">{subtitle}</p>}</div>
      {action}
    </header>
  );
}

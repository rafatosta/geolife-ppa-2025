import type { ReactNode } from 'react';

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return <div className="flex items-center justify-between"><h2 className="text-base font-bold">{title}</h2>{action}</div>;
}

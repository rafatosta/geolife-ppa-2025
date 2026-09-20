import type { LedgerEntry } from '../../types/domain';
import { formatShortDate } from '../../utils/format';
import { EmptyState } from '../ui/States';
import { MoneyAmount } from '../ui/MoneyAmount';

export function DiscountHistory({ entries, compact = false }: { entries: LedgerEntry[]; compact?: boolean }) {
  const shown = compact ? entries.slice(0, 3) : entries;
  if (!shown.length) return <EmptyState title="Nenhum desconto registrado" description="Os lançamentos aparecerão aqui." />;
  return <div className="divide-y divide-border rounded-card border bg-white px-4">{shown.map((entry) => <div className="flex items-center justify-between gap-3 py-4" key={entry.id}><div><p className="text-sm font-semibold">{entry.reason}</p><p className="mt-0.5 text-xs text-ink-secondary">{formatShortDate(entry.created_at)}</p></div><MoneyAmount value={Math.abs(entry.value)} negative className="text-sm font-bold" /></div>)}</div>;
}

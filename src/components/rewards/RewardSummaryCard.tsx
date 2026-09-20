import { Sparkles } from 'lucide-react';
import type { RewardSummary } from '../../types/domain';
import { Card } from '../ui/Card';
import { MoneyAmount } from '../ui/MoneyAmount';
import { ProgressBar } from '../ui/ProgressBar';

export function RewardSummaryCard({ summary, month = 'Agosto' }: { summary: RewardSummary; month?: string }) {
  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary-dark to-primary p-6 text-white shadow-[0_18px_40px_rgba(22,134,111,.18)]">
      <div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-white/75">{month}</p><p className="text-sm text-white/75">Meta do mês</p></div><span className="rounded-full bg-white/15 p-2"><Sparkles className="size-5" aria-hidden /></span></div>
      <p className="mt-5 text-4xl font-extrabold tracking-tight"><MoneyAmount value={summary.current_value} /></p>
      <p className="mt-1 text-sm text-white/70">de <MoneyAmount value={summary.maximum_value} /></p>
      <div className="mt-5"><ProgressBar value={summary.percentage} /></div>
      <p className="mt-2 text-right text-sm font-bold">{summary.percentage}%</p>
    </Card>
  );
}

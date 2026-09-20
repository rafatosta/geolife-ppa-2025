import { useDiscountHistory, useReward } from '../../hooks/useReward';
import { DiscountHistory } from '../../components/rewards/DiscountHistory';
import { Card } from '../../components/ui/Card';
import { MoneyAmount } from '../../components/ui/MoneyAmount';
import { PageHeader } from '../../components/ui/PageHeader';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ErrorState, LoadingState } from '../../components/ui/States';

export function ProgressPage() {
  const reward = useReward(); const history = useDiscountHistory();
  if (reward.loading || history.loading) return <LoadingState />; if (reward.error || history.error || !reward.data) return <ErrorState message={reward.error ?? history.error ?? 'Não foi possível carregar o progresso.'} onRetry={() => { void reward.refresh(); void history.refresh(); }} />;
  const values = [{ label: 'Meta inicial', value: reward.data.maximum_value }, { label: 'Valor atual', value: reward.data.current_value }, { label: 'Total descontado', value: reward.data.discount_total, danger: true }];
  return <div className="space-y-section"><PageHeader title="Progresso" subtitle="Acompanhe sua meta mensal" /><Card><div className="grid grid-cols-3 gap-2">{values.map((item) => <div key={item.label}><p className="text-xs text-ink-secondary">{item.label}</p><MoneyAmount value={item.value} className={`mt-1 block text-base font-bold ${item.danger ? 'text-danger' : ''}`} /></div>)}</div><div className="mt-5"><div className="mb-2 flex justify-between text-sm"><span>Meta preservada</span><strong>{reward.data.percentage}%</strong></div><ProgressBar value={reward.data.percentage} /></div></Card><section><h2 className="mb-3 font-bold">Histórico de descontos</h2><DiscountHistory entries={history.data ?? []} /></section></div>;
}

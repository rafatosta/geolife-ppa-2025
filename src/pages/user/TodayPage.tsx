import { endOfDay, startOfDay } from 'date-fns';
import { useAgenda } from '../../hooks/useAgenda';
import { useReward } from '../../hooks/useReward';
import { OccurrenceCard } from '../../components/agenda/OccurrenceCard';
import { RewardSummaryCard } from '../../components/rewards/RewardSummaryCard';
import { Card } from '../../components/ui/Card';
import { ErrorState, LoadingState, EmptyState } from '../../components/ui/States';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { formatLongDate, formatMoney } from '../../utils/format';

export function TodayPage() {
  const today = new Date(); const agenda = useAgenda(startOfDay(today), endOfDay(today)); const reward = useReward();
  if (agenda.loading || reward.loading) return <LoadingState label="Carregando o seu dia…" />;
  if (agenda.error || reward.error || !reward.data) return <ErrorState message={agenda.error ?? reward.error ?? 'Não foi possível carregar seu resumo.'} onRetry={() => { void agenda.refresh(); void reward.refresh(); }} />;
  const completed = agenda.data?.filter((item) => ['completed', 'approved'].includes(item.status)).length ?? 0;
  const pending = agenda.data?.filter((item) => ['pending', 'draft', 'rejected'].includes(item.status)).length ?? 0;
  return <div className="space-y-section"><RewardSummaryCard summary={reward.data} month={new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(today)} /><div className="grid grid-cols-3 gap-2"><Card className="p-3 text-center shadow-none"><strong className="block text-lg text-success">{completed}</strong><span className="text-xs text-ink-secondary">Concluídas</span></Card><Card className="p-3 text-center shadow-none"><strong className="block text-lg text-warning">{pending}</strong><span className="text-xs text-ink-secondary">Pendentes</span></Card><Card className="p-3 text-center shadow-none"><strong className="block text-base text-danger">{formatMoney(reward.data.discount_total)}</strong><span className="text-xs text-ink-secondary">Descontos</span></Card></div><section className="space-y-3"><SectionHeader title={`Hoje, ${formatLongDate(today)}`} />{agenda.data?.length ? agenda.data.map((item) => <OccurrenceCard key={item.id} occurrence={item} onChanged={agenda.refresh} />) : <EmptyState title="Nenhuma atividade para hoje" description="Aproveite o seu tempo livre." />}</section></div>;
}

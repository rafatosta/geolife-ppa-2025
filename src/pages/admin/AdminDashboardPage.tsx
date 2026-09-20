import { CheckCircle2 } from 'lucide-react';
import { SubmissionPreview } from '../../components/activities/SubmissionPreview';
import { DiscountHistory } from '../../components/rewards/DiscountHistory';
import { RewardSummaryCard } from '../../components/rewards/RewardSummaryCard';
import { Badge } from '../../components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { usePendingSubmissions } from '../../hooks/usePendingUsers';
import { useDiscountHistory, useReward } from '../../hooks/useReward';

export function AdminDashboardPage() {
  const reward = useReward(); const submissions = usePendingSubmissions(); const history = useDiscountHistory();
  if (reward.loading || submissions.loading || history.loading) return <LoadingState label="Carregando painel…" />; const error = reward.error ?? submissions.error ?? history.error; if (error || !reward.data) return <ErrorState message={error ?? 'Não foi possível carregar o painel.'} onRetry={() => { void reward.refresh(); void submissions.refresh(); void history.refresh(); }} />;
  return <div className="space-y-section"><RewardSummaryCard summary={reward.data} /><section className="space-y-3"><SectionHeader title="Aguardando confirmação" action={<Badge tone="warning">{submissions.data?.length ?? 0}</Badge>} />{submissions.data?.length ? submissions.data.map((item) => <SubmissionPreview key={item.id} submission={item} onReviewed={submissions.refresh} />) : <EmptyState title="Tudo revisado" description="Nenhuma atividade aguarda confirmação." />}</section><section><SectionHeader title="Resumo do dia" /><div className="mt-3 rounded-card border bg-white p-4"><p className="flex items-center gap-2 text-sm"><CheckCircle2 className="size-4 text-success" />As ocorrências do dia aparecem na agenda administrativa.</p></div></section><section className="space-y-3"><SectionHeader title="Últimos descontos" /><DiscountHistory entries={history.data ?? []} compact /></section></div>;
}

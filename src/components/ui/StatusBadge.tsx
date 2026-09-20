import type { OccurrenceStatus, UserStatus } from '../../types/domain';
import { Badge } from './Badge';

const labels: Record<OccurrenceStatus | UserStatus, string> = {
  pending: 'Pendente', completed: 'Concluída', missed: 'Não realizada', justified: 'Justificada',
  draft: 'Rascunho', submitted: 'Enviada', awaiting_confirmation: 'Aguardando confirmação',
  approved: 'Aprovada', rejected: 'Rejeitada', active: 'Ativo', blocked: 'Bloqueado',
};

export function StatusBadge({ status }: { status: OccurrenceStatus | UserStatus }) {
  const tone = ['completed', 'approved', 'active', 'justified'].includes(status)
    ? 'success'
    : ['missed', 'rejected', 'blocked'].includes(status)
      ? 'danger'
      : 'warning';
  return <Badge tone={tone}>{labels[status]}</Badge>;
}

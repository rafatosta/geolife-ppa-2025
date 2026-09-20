import { CalendarCheck, Check, Clock3 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { agendaService } from '../../services/agendaService';
import { adminService } from '../../services/adminService';
import type { Occurrence } from '../../types/domain';
import { formatTime } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PromptDialog } from '../ui/PromptDialog';
import { StatusBadge } from '../ui/StatusBadge';

interface OccurrenceCardProps {
  occurrence: Occurrence;
  admin?: boolean;
  onChanged?: () => void | Promise<void>;
}

export function OccurrenceCard({ occurrence, admin = false, onChanged }: OccurrenceCardProps) {
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isActivity = occurrence.rule.type === 'activity';
  const time = isActivity ? `Prazo até ${formatTime(occurrence.rule.deadline_time)}` : [formatTime(occurrence.rule.start_time), formatTime(occurrence.rule.end_time)].filter(Boolean).join(' às ');

  const complete = async () => {
    setAction('completed');
    setError(null);
    try {
      await agendaService.completeCommitment(occurrence.id);
      await onChanged?.();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível concluir o compromisso.');
    } finally {
      setAction(null);
    }
  };

  const adminChange = async (status: 'completed' | 'missed' | 'justified', reason = '') => {
    setAction(status); setError(null);
    try { await adminService.setOccurrenceStatus(occurrence.id, status, reason); await onChanged?.(); }
    catch (reasonValue) { setError(reasonValue instanceof Error ? reasonValue.message : 'Não foi possível atualizar a ocorrência.'); }
    finally { setAction(null); }
  };

  return (
    <Card className="p-4 shadow-none transition hover:shadow-card">
      <div className="flex gap-3">
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${isActivity ? 'bg-primary-soft text-activity' : 'bg-[#eeeafd] text-commitment'}`}><CalendarCheck className="size-5" aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2"><div><h3 className="font-bold">{occurrence.rule.title}</h3><Badge tone={isActivity ? 'success' : 'purple'} className="mt-1">{isActivity ? 'Atividade' : 'Compromisso'}</Badge></div><StatusBadge status={occurrence.status} /></div>
          {admin && occurrence.profile && <p className="mt-2 text-xs font-semibold text-ink-secondary">{occurrence.profile.name} · {occurrence.profile.email}</p>}
          {time && <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-secondary"><Clock3 className="size-4" aria-hidden />{time}</p>}
          {isActivity && ['pending', 'draft', 'rejected'].includes(occurrence.status) && <Link className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark" to={`/atividade/${occurrence.id}`}>Registrar atividade</Link>}
          {!admin && !isActivity && occurrence.status === 'pending' && <Button fullWidth variant="secondary" className="mt-4" icon={<Check className="size-4" />} loading={action === 'completed'} onClick={complete}>Marcar como concluído</Button>}
          {admin && occurrence.status === 'pending' && <div className="mt-4 grid grid-cols-2 gap-2">{!isActivity && <><Button variant="secondary" loading={action === 'completed'} onClick={() => adminChange('completed')}>Concluir</Button><Button variant="ghost" loading={action === 'justified'} onClick={() => adminChange('justified')}>Justificar</Button></>}<PromptDialog trigger={<Button variant="danger" className={isActivity ? 'col-span-2' : 'col-span-2'}>Não realizada</Button>} title="Registrar ocorrência não realizada?" description="A penalidade configurada será lançada na meta do período." confirmLabel="Aplicar penalidade" optional={false} onConfirm={(reason) => adminChange('missed', reason)} /></div>}
          {error && <p role="alert" className="mt-3 rounded-control bg-danger-soft p-3 text-sm text-danger">{error}</p>}
        </div>
      </div>
    </Card>
  );
}

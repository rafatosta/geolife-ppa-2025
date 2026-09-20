import { Clock3 } from 'lucide-react';
import type { Submission } from '../../types/domain';
import { adminService } from '../../services/adminService';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PromptDialog } from '../ui/PromptDialog';

export function SubmissionPreview({ submission, onReviewed }: { submission: Submission; onReviewed: () => void }) {
  const title = submission.occurrence?.rule.title ?? 'Atividade';
  const name = submission.profile?.name ?? 'Usuário';
  const approve = async () => { await adminService.reviewSubmission(submission.id, true); onReviewed(); };
  const reject = async (comment: string) => { await adminService.reviewSubmission(submission.id, false, comment); onReviewed(); };
  return <Card className="p-4"><div className="flex items-center gap-3"><Avatar src={submission.profile?.avatar_url} name={name} /><div><h3 className="font-bold">{title}</h3><p className="text-sm text-ink-secondary">Enviado por {name}</p></div></div>{submission.submitted_at && <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-secondary"><Clock3 className="size-4" />Enviado às {new Date(submission.submitted_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>}{submission.note && <p className="mt-3 rounded-xl bg-surface-muted p-3 text-sm">{submission.note}</p>}{submission.photos.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2">{submission.photos.map((photo, index) => <div key={photo.id} className="aspect-square overflow-hidden rounded-xl bg-surface-muted">{photo.signed_url ? <img src={photo.signed_url} alt={`Evidência ${index + 1}`} className="size-full object-cover" /> : <span className="flex size-full items-center justify-center text-xs text-ink-secondary">Foto {index + 1}</span>}</div>)}</div>}<div className="mt-4 flex gap-2"><Button className="flex-1" onClick={approve}>Aprovar</Button><PromptDialog trigger={<Button variant="danger" className="flex-1">Rejeitar</Button>} title="Rejeitar atividade?" description="O usuário poderá corrigir e reenviar a atividade." confirmLabel="Rejeitar" onConfirm={reject} /></div></Card>;
}

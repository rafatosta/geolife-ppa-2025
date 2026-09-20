import type { Profile, UserStatus } from '../../types/domain';
import { formatRequestDate } from '../../utils/format';
import { adminService } from '../../services/adminService';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { StatusBadge } from '../ui/StatusBadge';

export function PendingUserCard({ profile, onChanged }: { profile: Profile; onChanged: () => void }) {
  const change = async (status: UserStatus) => { await adminService.setUserStatus(profile.id, status); onChanged(); };
  return <Card className="p-4"><div className="flex items-center gap-3"><Avatar src={profile.avatar_url} name={profile.name} /><div className="min-w-0 flex-1"><p className="truncate font-bold">{profile.name}</p><p className="truncate text-sm text-ink-secondary">{profile.email}</p></div><StatusBadge status={profile.status} /></div><p className="mt-3 text-xs text-ink-secondary">Solicitado em {formatRequestDate(profile.created_at)}</p><div className="mt-4 flex gap-2">{profile.status === 'pending' && <><Button className="flex-1" onClick={() => change('active')}>Aprovar</Button><ConfirmDialog trigger={<Button variant="danger" className="flex-1">Rejeitar</Button>} title="Rejeitar cadastro?" description={`O acesso de ${profile.name} será negado.`} confirmLabel="Rejeitar" destructive onConfirm={() => change('rejected')} /></>}{profile.status === 'active' && <ConfirmDialog trigger={<Button variant="danger" fullWidth>Bloquear</Button>} title="Bloquear usuário?" description="O usuário perderá imediatamente o acesso aos dados do aplicativo." confirmLabel="Bloquear" destructive onConfirm={() => change('blocked')} />}{['blocked', 'rejected'].includes(profile.status) && <Button fullWidth onClick={() => change('active')}>Reativar</Button>}</div></Card>;
}

import { LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { useProfile } from '../../app/providers/ProfileProvider';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';

export function ProfilePage() {
  const { profile } = useProfile(); const { signOut } = useAuth(); if (!profile) return null;
  return <div className="space-y-section"><PageHeader title="Perfil" /><Card className="text-center"><Avatar src={profile.avatar_url} name={profile.name} className="mx-auto size-20" /><h2 className="mt-4 text-xl font-bold">{profile.name}</h2><p className="mt-1 text-sm text-ink-secondary">{profile.email}</p><div className="mt-4 flex justify-center gap-2"><Badge tone="success"><ShieldCheck className="mr-1 size-3" />{profile.role === 'admin' ? 'Administrador' : 'Usuário'}</Badge><Badge tone="success">Ativo</Badge></div></Card><Card className="shadow-none"><p className="text-sm leading-6 text-ink-secondary">Seu papel e status são definidos pelo administrador e não podem ser alterados nesta tela.</p></Card><Button fullWidth variant="danger" icon={<LogOut className="size-4" />} onClick={signOut}>Sair</Button></div>;
}

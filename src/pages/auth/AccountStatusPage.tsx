import { Ban, Clock3, ShieldX } from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const content = {
  pending: { title: 'Cadastro recebido', description: 'Sua conta está aguardando aprovação do administrador. Você poderá acessar o aplicativo assim que o cadastro for autorizado.', icon: Clock3, color: 'bg-warning-soft text-warning' },
  rejected: { title: 'Acesso não autorizado', description: 'Seu cadastro não foi aprovado. Se acreditar que houve um engano, entre em contato com o administrador.', icon: ShieldX, color: 'bg-danger-soft text-danger' },
  blocked: { title: 'Acesso suspenso', description: 'Sua conta está temporariamente bloqueada. Entre em contato com o administrador para mais informações.', icon: Ban, color: 'bg-danger-soft text-danger' },
} as const;

export function AccountStatusPage({ status }: { status: keyof typeof content }) {
  const { signOut } = useAuth(); const item = content[status]; const Icon = item.icon;
  return <main className="flex min-h-screen items-center justify-center p-page"><Card className="w-full max-w-md p-7 text-center"><span className={`mx-auto flex size-14 items-center justify-center rounded-2xl ${item.color}`}><Icon className="size-7" aria-hidden /></span><h1 className="mt-5 text-2xl font-bold">{item.title}</h1><p className="mt-3 leading-6 text-ink-secondary">{item.description}</p><Button variant="ghost" className="mt-7" onClick={signOut}>Sair</Button></Card></main>;
}

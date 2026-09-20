import { CalendarDays, CircleUserRound, Home, LayoutDashboard, Settings, TrendingUp, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';

const userItems = [
  { to: '/hoje', label: 'Hoje', icon: Home }, { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/progresso', label: 'Progresso', icon: TrendingUp }, { to: '/perfil', label: 'Perfil', icon: CircleUserRound },
];
const adminItems = [
  { to: '/admin', label: 'Resumo', icon: LayoutDashboard, end: true }, { to: '/admin/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users }, { to: '/admin/configuracoes', label: 'Ajustes', icon: Settings },
];

export function BottomNavigation({ admin = false }: { admin?: boolean }) {
  return (
    <nav aria-label="Navegação principal" className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 px-2 pt-2 backdrop-blur md:absolute md:rounded-b-[2rem]">
      <ul className="mx-auto grid max-w-xl grid-cols-4">
        {(admin ? adminItems : userItems).map(({ to, label, icon: Icon }) => (
          <li key={to}><NavLink end={admin && to === '/admin'} to={to} className={({ isActive }) => cn('flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold text-ink-secondary', isActive && 'bg-primary-soft text-primary-dark')}><Icon className="size-5" aria-hidden />{label}</NavLink></li>
        ))}
      </ul>
    </nav>
  );
}

import { Outlet } from 'react-router-dom';
import { Avatar } from '../ui/Avatar';
import { BottomNavigation } from './BottomNavigation';
import { useProfile } from '../../app/providers/ProfileProvider';

export function AppShell({ admin = false }: { admin?: boolean }) {
  const { profile } = useProfile();
  return (
    <div className="relative mx-auto min-h-screen max-w-3xl bg-[#fbfcfa] md:my-5 md:min-h-[calc(100vh-2.5rem)] md:overflow-hidden md:rounded-[2rem] md:border md:shadow-card">
      <header className="flex items-center justify-between px-page pb-2 pt-5 md:px-8">
        <div><p className="text-lg font-extrabold tracking-tight text-primary-dark">Geolife PPA 2025</p>{admin && <p className="text-xs font-medium text-ink-secondary">Administrador</p>}</div>
        {profile && <Avatar src={profile.avatar_url} name={profile.name} />}
      </header>
      <main className="px-page pb-28 pt-3 md:px-8"><Outlet /></main>
      <BottomNavigation admin={admin} />
    </div>
  );
}

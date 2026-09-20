import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/ui/States';
import { useAuth } from '../providers/AuthProvider';
import { useProfile } from '../providers/ProfileProvider';

export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState label="Verificando sua sessão…" />;
  return user ? <Navigate to="/" replace /> : <Outlet />;
}

export function SessionRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingState label="Verificando sua sessão…" />;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}

export function ActiveRoute({ admin = false }: { admin?: boolean }) {
  const { profile, loading, error, refresh } = useProfile();
  if (loading) return <LoadingState label="Preparando o Meta Escolar…" />;
  if (error || !profile) return <main className="mx-auto max-w-md p-page"><ErrorState message={error ?? 'Perfil não encontrado.'} onRetry={refresh} /></main>;
  if (profile.status === 'pending') return <Navigate to="/aguardando-aprovacao" replace />;
  if (profile.status === 'rejected') return <Navigate to="/acesso-negado" replace />;
  if (profile.status === 'blocked') return <Navigate to="/acesso-bloqueado" replace />;
  if (admin && profile.role !== 'admin') return <Navigate to="/hoje" replace />;
  if (!admin && profile.role === 'admin') return <Navigate to="/admin" replace />;
  return <Outlet />;
}

export function RootRedirect() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  if (authLoading || (user && profileLoading)) return <LoadingState label="Preparando o Meta Escolar…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile) return <Navigate to="/login" replace />;
  const paths = { pending: '/aguardando-aprovacao', rejected: '/acesso-negado', blocked: '/acesso-bloqueado' } as const;
  if (profile.status !== 'active') return <Navigate to={paths[profile.status]} replace />;
  return <Navigate to={profile.role === 'admin' ? '/admin' : '/hoje'} replace />;
}

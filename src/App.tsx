import { lazy, Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { LoadingState } from './components/ui/States';
import { ActiveRoute, PublicOnlyRoute, RootRedirect, SessionRoute } from './app/routes/guards';
import { AccountStatusPage } from './pages/auth/AccountStatusPage';

const LoginPage = lazy(() => import('./pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })));
const TodayPage = lazy(() => import('./pages/user/TodayPage').then((module) => ({ default: module.TodayPage })));
const AgendaPage = lazy(() => import('./pages/user/AgendaPage').then((module) => ({ default: module.AgendaPage })));
const ActivityPage = lazy(() => import('./pages/user/ActivityPage').then((module) => ({ default: module.ActivityPage })));
const ProgressPage = lazy(() => import('./pages/user/ProgressPage').then((module) => ({ default: module.ProgressPage })));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then((module) => ({ default: module.AdminUsersPage })));
const AdminAgendaPage = lazy(() => import('./pages/admin/AdminAgendaPage').then((module) => ({ default: module.AdminAgendaPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then((module) => ({ default: module.AdminSettingsPage })));

export default function App() {
  return <HashRouter><Suspense fallback={<LoadingState label="Abrindo página…" />}><Routes><Route path="/" element={<RootRedirect />} /><Route element={<PublicOnlyRoute />}><Route path="/login" element={<LoginPage />} /></Route><Route element={<SessionRoute />}><Route path="/aguardando-aprovacao" element={<AccountStatusPage status="pending" />} /><Route path="/acesso-negado" element={<AccountStatusPage status="rejected" />} /><Route path="/acesso-bloqueado" element={<AccountStatusPage status="blocked" />} /><Route element={<ActiveRoute />}><Route element={<AppShell />}><Route path="/hoje" element={<TodayPage />} /><Route path="/agenda" element={<AgendaPage />} /><Route path="/atividade/:id" element={<ActivityPage />} /><Route path="/progresso" element={<ProgressPage />} /><Route path="/perfil" element={<ProfilePage />} /></Route></Route><Route element={<ActiveRoute admin />}><Route element={<AppShell admin />}><Route path="/admin" element={<AdminDashboardPage />} /><Route path="/admin/agenda" element={<AdminAgendaPage />} /><Route path="/admin/usuarios" element={<AdminUsersPage />} /><Route path="/admin/configuracoes" element={<AdminSettingsPage />} /></Route></Route></Route><Route path="*" element={<RootRedirect />} /></Routes></Suspense></HashRouter>;
}

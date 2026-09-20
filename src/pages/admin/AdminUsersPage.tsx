import * as Tabs from '@radix-ui/react-tabs';
import { useState } from 'react';
import { PendingUserCard } from '../../components/admin/PendingUserCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States';
import { useUsers } from '../../hooks/usePendingUsers';
import { cn } from '../../lib/cn';
import type { UserStatus } from '../../types/domain';

const tabs: { value: UserStatus; label: string }[] = [{ value: 'pending', label: 'Pendentes' }, { value: 'active', label: 'Ativos' }, { value: 'rejected', label: 'Rejeitados' }, { value: 'blocked', label: 'Bloqueados' }];

export function AdminUsersPage() {
  const [status, setStatus] = useState<UserStatus>('pending'); const users = useUsers(status);
  return <div className="space-y-section"><PageHeader title="Usuários" subtitle="Aprovação e controle de acesso" /><Tabs.Root value={status} onValueChange={(value) => setStatus(value as UserStatus)}><Tabs.List aria-label="Filtrar usuários" className="flex gap-1 overflow-x-auto rounded-control bg-surface-muted p-1">{tabs.map((tab) => <Tabs.Trigger key={tab.value} value={tab.value} className={cn('min-h-10 flex-1 whitespace-nowrap rounded-xl px-3 text-xs font-semibold text-ink-secondary data-[state=active]:bg-white data-[state=active]:text-primary-dark data-[state=active]:shadow-sm')}>{tab.label}</Tabs.Trigger>)}</Tabs.List><Tabs.Content value={status} className="mt-4 space-y-3">{users.loading ? <LoadingState /> : users.error ? <ErrorState message={users.error} onRetry={users.refresh} /> : users.data?.length ? users.data.map((profile) => <PendingUserCard key={profile.id} profile={profile} onChanged={users.refresh} />) : <EmptyState title={`Nenhum usuário em “${tabs.find((tab) => tab.value === status)?.label}”`} />}</Tabs.Content></Tabs.Root></div>;
}

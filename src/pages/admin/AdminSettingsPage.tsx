import { CalendarPlus, LogOut, Pencil, Power, Trash2, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAsync } from '../../hooks/useAsync';
import { cn } from '../../lib/cn';
import { adminService } from '../../services/adminService';
import type { Profile, RewardPeriod, Rule, RuleInput, RuleType, Weekday } from '../../types/domain';
import { formatMoney } from '../../utils/format';

const weekdays: { value: Weekday; label: string }[] = [
  { value: 'SEG', label: 'Seg' }, { value: 'TER', label: 'Ter' }, { value: 'QUA', label: 'Qua' },
  { value: 'QUI', label: 'Qui' }, { value: 'SEX', label: 'Sex' }, { value: 'SAB', label: 'Sáb' }, { value: 'DOM', label: 'Dom' },
];
const fieldClass = 'mt-1.5 min-h-11 w-full rounded-control border bg-white px-3 text-sm';

function value(form: FormData, name: string) {
  return String(form.get(name) ?? '').trim();
}

function RuleForm({ rule, users, saving, onCancel, onSave }: {
  rule: Rule | null;
  users: Profile[];
  saving: boolean;
  onCancel: () => void;
  onSave: (input: RuleInput) => Promise<void>;
}) {
  const [type, setType] = useState<RuleType>(rule?.type ?? 'commitment');
  const [selectedDays, setSelectedDays] = useState<Weekday[]>(rule?.weekdays ?? ['SEG', 'TER', 'QUA', 'QUI', 'SEX']);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDays.length) { setError('Selecione ao menos um dia da semana.'); return; }
    const form = new FormData(event.currentTarget);
    setError(null);
    try {
      await onSave({
        user_id: rule?.user_id ?? value(form, 'user_id'),
        type,
        title: value(form, 'title'),
        description: value(form, 'description'),
        start_date: value(form, 'start_date'),
        start_time: value(form, 'start_time') || null,
        end_time: type === 'commitment' ? value(form, 'end_time') || null : null,
        deadline_time: type === 'activity' ? value(form, 'deadline_time') || null : null,
        repeat_every_weeks: Number(value(form, 'repeat_every_weeks')),
        end_date: value(form, 'end_date') || null,
        max_occurrences: value(form, 'max_occurrences') ? Number(value(form, 'max_occurrences')) : null,
        penalty_value: Number(value(form, 'penalty_value')),
        requires_evidence: type === 'activity' && form.get('requires_evidence') === 'on',
        requires_admin_approval: type === 'activity' && form.get('requires_admin_approval') === 'on',
        weekdays: selectedDays,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar a regra.');
    }
  };

  return <Card><div className="mb-4 flex items-center justify-between"><h2 className="font-bold">{rule ? 'Editar regra' : 'Nova regra'}</h2><Button variant="ghost" icon={<X className="size-4" />} onClick={onCancel}>Cancelar</Button></div><form className="space-y-4" onSubmit={submit}>{!rule && <div><label className="text-sm font-semibold" htmlFor="user_id">Usuário</label><select required id="user_id" name="user_id" className={fieldClass} defaultValue=""><option value="" disabled>Selecione</option>{users.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</select></div>}<div><span className="text-sm font-semibold">Tipo</span><div className="mt-2 grid grid-cols-2 gap-2">{(['commitment', 'activity'] as const).map((item) => <button key={item} type="button" disabled={Boolean(rule)} onClick={() => setType(item)} className={cn('min-h-11 rounded-control border text-sm font-semibold disabled:cursor-not-allowed', type === item && (item === 'commitment' ? 'border-commitment bg-[#eeeafd] text-commitment' : 'border-primary bg-primary-soft text-primary-dark'))}>{item === 'commitment' ? 'Compromisso' : 'Atividade'}</button>)}</div>{rule && <p className="mt-1 text-xs text-ink-secondary">Usuário e tipo não são alterados para preservar o histórico.</p>}</div><div><label className="text-sm font-semibold" htmlFor="title">Título</label><input required maxLength={120} id="title" name="title" className={fieldClass} defaultValue={rule?.title} /></div><div><label className="text-sm font-semibold" htmlFor="description">Descrição</label><textarea maxLength={500} id="description" name="description" className="mt-1.5 min-h-20 w-full rounded-control border p-3 text-sm" defaultValue={rule?.description ?? ''} /></div><fieldset><legend className="text-sm font-semibold">Dias da semana</legend><div className="mt-2 grid grid-cols-7 gap-1">{weekdays.map((day) => { const selected = selectedDays.includes(day.value); return <button type="button" aria-pressed={selected} key={day.value} onClick={() => setSelectedDays((current) => selected ? current.filter((item) => item !== day.value) : [...current, day.value])} className={cn('min-h-10 rounded-xl text-xs font-semibold', selected ? 'bg-primary text-white' : 'bg-surface-muted text-ink-secondary')}>{day.label}</button>; })}</div></fieldset><div className="grid grid-cols-2 gap-3"><label className="text-sm font-semibold">Início<input required type="date" name="start_date" className={fieldClass} defaultValue={rule?.start_date} /></label><label className="text-sm font-semibold">Repete a cada<input required min="1" max="52" type="number" name="repeat_every_weeks" defaultValue={rule?.repeat_every_weeks ?? 1} className={fieldClass} /><span className="mt-1 block text-xs font-normal text-ink-secondary">semana(s)</span></label></div><div className="grid grid-cols-2 gap-3"><label className="text-sm font-semibold">Horário inicial<input type="time" name="start_time" className={fieldClass} defaultValue={rule?.start_time ?? ''} /></label>{type === 'commitment' ? <label className="text-sm font-semibold">Horário final<input type="time" name="end_time" className={fieldClass} defaultValue={rule?.end_time ?? ''} /></label> : <label className="text-sm font-semibold">Prazo<input required type="time" name="deadline_time" className={fieldClass} defaultValue={rule?.deadline_time ?? ''} /></label>}</div><div className="grid grid-cols-2 gap-3"><label className="text-sm font-semibold">Data final<input type="date" name="end_date" className={fieldClass} defaultValue={rule?.end_date ?? ''} /></label><label className="text-sm font-semibold">Máx. ocorrências<input min="1" type="number" name="max_occurrences" className={fieldClass} defaultValue={rule?.max_occurrences ?? ''} /></label></div><label className="block text-sm font-semibold">Penalidade (R$)<input required min="0" step="0.01" type="number" name="penalty_value" defaultValue={rule?.penalty_value ?? 0} className={fieldClass} /></label>{type === 'activity' && <div className="space-y-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="requires_evidence" defaultChecked={rule?.requires_evidence ?? true} className="size-4 accent-primary" />Exigir evidências</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="requires_admin_approval" defaultChecked={rule?.requires_admin_approval ?? true} className="size-4 accent-primary" />Exigir aprovação do administrador</label></div>}{error && <p role="alert" className="rounded-control bg-danger-soft p-3 text-sm text-danger">{error}</p>}<Button fullWidth type="submit" loading={saving}>{rule ? 'Salvar alterações' : 'Criar regra e ocorrências'}</Button></form></Card>;
}

function PeriodForm({ period, users, saving, onCancel, onSave }: {
  period: RewardPeriod | null;
  users: Profile[];
  saving: boolean;
  onCancel: () => void;
  onSave: (input: { user_id: string; start_date: string; end_date: string; maximum_value: number }) => Promise<void>;
}) {
  return <Card><div className="flex items-center justify-between"><h2 className="font-bold">{period ? 'Editar meta mensal' : 'Nova meta mensal'}</h2>{period && <Button variant="ghost" onClick={onCancel}>Cancelar</Button>}</div><form className="mt-3 grid grid-cols-2 gap-3" onSubmit={async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); await onSave({ user_id: period?.user_id ?? value(form, 'period_user_id'), start_date: value(form, 'period_start'), end_date: value(form, 'period_end'), maximum_value: Number(value(form, 'maximum_value')) }); }}><label className="col-span-2 text-sm font-semibold">Usuário<select required name="period_user_id" disabled={Boolean(period)} className={fieldClass} defaultValue={period?.user_id ?? ''}><option value="" disabled>Selecione</option>{users.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</select></label><label className="text-sm font-semibold">Início<input required type="date" name="period_start" className={fieldClass} defaultValue={period?.start_date} /></label><label className="text-sm font-semibold">Fim<input required type="date" name="period_end" className={fieldClass} defaultValue={period?.end_date} /></label><label className="col-span-2 text-sm font-semibold">Valor máximo (R$)<input required min="0" step="0.01" type="number" name="maximum_value" className={fieldClass} defaultValue={period?.maximum_value} /></label><Button className="col-span-2" type="submit" loading={saving}>{period ? 'Salvar alterações' : 'Criar meta'}</Button></form></Card>;
}

export function AdminSettingsPage() {
  const { signOut } = useAuth();
  const rules = useAsync(() => adminService.listRules(), []);
  const users = useAsync(() => adminService.listUsers('active'), []);
  const periods = useAsync(() => adminService.listRewardPeriods(), []);
  const [ruleFormOpen, setRuleFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [editingPeriod, setEditingPeriod] = useState<RewardPeriod | null>(null);
  const [saving, setSaving] = useState(false);
  const [periodSaving, setPeriodSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (rules.loading || users.loading || periods.loading) return <LoadingState />;
  if (rules.error || users.error || periods.error) return <ErrorState message={rules.error ?? users.error ?? periods.error ?? 'Não foi possível carregar as configurações.'} onRetry={() => { void rules.refresh(); void users.refresh(); void periods.refresh(); }} />;
  const activeUsers = users.data?.filter((profile) => profile.role === 'user') ?? [];

  const closeRuleForm = () => { setRuleFormOpen(false); setEditingRule(null); };
  return <div className="space-y-section"><PageHeader title="Regras" subtitle="Compromissos, atividades e recorrência" action={<Button icon={<CalendarPlus className="size-4" />} onClick={() => { setEditingRule(null); setRuleFormOpen(true); }}>Nova</Button>} />{error && <p role="alert" className="rounded-control bg-danger-soft p-3 text-sm text-danger">{error}</p>}<PeriodForm key={editingPeriod?.id ?? 'new-period'} period={editingPeriod} users={activeUsers} saving={periodSaving} onCancel={() => setEditingPeriod(null)} onSave={async (input) => { setPeriodSaving(true); setError(null); try { await adminService.saveRewardPeriod(input, editingPeriod?.id); setEditingPeriod(null); await periods.refresh(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível salvar a meta.'); } finally { setPeriodSaving(false); } }} />{periods.data?.length ? <section className="space-y-3"><h2 className="font-bold">Metas cadastradas</h2>{periods.data.map((period) => <Card key={period.id} className="p-4 shadow-none"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{period.profile?.name ?? 'Usuário'}</h3><p className="mt-1 text-sm text-ink-secondary">{period.start_date} a {period.end_date} · {formatMoney(period.maximum_value)}</p></div><div className="flex"><Button variant="ghost" aria-label="Editar meta" icon={<Pencil className="size-4" />} onClick={() => setEditingPeriod(period)}>Editar</Button><ConfirmDialog trigger={<Button variant="danger" aria-label="Excluir meta" icon={<Trash2 className="size-4" />}>Excluir</Button>} title="Excluir meta mensal?" description="A exclusão só será permitida se a meta ainda não possuir lançamentos no histórico." confirmLabel="Excluir" destructive onConfirm={async () => { await adminService.deleteRewardPeriod(period.id); await periods.refresh(); }} /></div></div></Card>)}</section> : null}{ruleFormOpen && <RuleForm key={editingRule?.id ?? 'new-rule'} rule={editingRule} users={activeUsers} saving={saving} onCancel={closeRuleForm} onSave={async (input) => { setSaving(true); try { await adminService.saveRule(input, editingRule?.id); closeRuleForm(); await rules.refresh(); } finally { setSaving(false); } }} />}<section className="space-y-3"><h2 className="font-bold">Regras cadastradas</h2>{rules.data?.length ? rules.data.map((rule) => <Card key={rule.id} className="p-4 shadow-none"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{rule.title}</h3><div className="mt-1 flex flex-wrap gap-1"><Badge tone={rule.type === 'activity' ? 'success' : 'purple'}>{rule.type === 'activity' ? 'Atividade' : 'Compromisso'}</Badge><Badge>{rule.weekdays?.join(' · ')}</Badge><Badge tone={rule.active ? 'success' : 'danger'}>{rule.active ? 'Ativa' : 'Inativa'}</Badge></div><p className="mt-2 text-sm text-ink-secondary">A cada {rule.repeat_every_weeks} semana(s) · Penalidade {formatMoney(rule.penalty_value)}</p></div><div className="flex flex-col gap-1"><Button variant="ghost" icon={<Pencil className="size-4" />} onClick={() => { setEditingRule(rule); setRuleFormOpen(true); }}>Editar</Button><Button variant={rule.active ? 'danger' : 'secondary'} icon={<Power className="size-4" />} onClick={async () => { await adminService.setRuleActive(rule.id, !rule.active); await rules.refresh(); }}>{rule.active ? 'Desativar' : 'Reativar'}</Button></div></div></Card>) : <EmptyState title="Nenhuma regra cadastrada" description="Crie o primeiro compromisso ou atividade." />}</section><Card className="shadow-none"><h2 className="font-bold">Sessão</h2><p className="mt-1 text-sm text-ink-secondary">Encerre com segurança o acesso desta conta neste dispositivo.</p><Button fullWidth variant="danger" className="mt-4" icon={<LogOut className="size-4" />} onClick={signOut}>Sair</Button></Card></div>;
}

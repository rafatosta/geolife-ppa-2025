import { addDays, endOfWeek, format, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { useAgenda } from '../../hooks/useAgenda';
import { OccurrenceCard } from '../../components/agenda/OccurrenceCard';
import { WeekCalendar } from '../../components/agenda/WeekCalendar';
import { Card } from '../../components/ui/Card';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States';
import { PageHeader } from '../../components/ui/PageHeader';

export function AgendaPage({ admin = false }: { admin?: boolean }) {
  const [selected, setSelected] = useState(new Date()); const start = startOfWeek(selected, { weekStartsOn: 1 }); const end = endOfWeek(selected, { weekStartsOn: 1 }); const agenda = useAgenda(start, end); const dayKey = format(selected, 'yyyy-MM-dd'); const items = agenda.data?.filter((item) => item.date === dayKey) ?? [];
  return <div className="space-y-section"><PageHeader title={admin ? 'Agenda administrativa' : 'Agenda'} subtitle={format(selected, 'MMMM yyyy', { locale: ptBR })} /><Card className="p-2 shadow-none"><WeekCalendar selected={selected} onSelect={setSelected} /><div className="flex justify-between px-2 pb-1 pt-2"><button className="text-xs text-ink-secondary" onClick={() => setSelected(addDays(selected, -7))}>Semana anterior</button><button className="text-xs text-ink-secondary" onClick={() => setSelected(addDays(selected, 7))}>Próxima semana</button></div></Card><section className="space-y-3"><h2 className="font-bold capitalize">{format(selected, "EEEE, d 'de' MMMM", { locale: ptBR })}</h2>{agenda.loading ? <LoadingState /> : agenda.error ? <ErrorState message={agenda.error} onRetry={agenda.refresh} /> : items.length ? items.map((item) => <OccurrenceCard key={item.id} occurrence={item} admin={admin} onChanged={agenda.refresh} />) : <EmptyState title="Nenhum compromisso neste dia" />}</section></div>;
}

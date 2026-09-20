import { addDays, format, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/cn';

export function WeekCalendar({ selected, onSelect }: { selected: Date; onSelect: (date: Date) => void }) {
  const start = startOfWeek(selected, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, index) => addDays(start, index));
  return (
    <div className="grid grid-cols-7 gap-1" aria-label="Selecionar dia">
      {days.map((day) => { const active = format(day, 'yyyy-MM-dd') === format(selected, 'yyyy-MM-dd'); return <button key={day.toISOString()} onClick={() => onSelect(day)} aria-pressed={active} className={cn('flex min-h-16 flex-col items-center justify-center rounded-xl text-xs font-semibold text-ink-secondary', active ? 'bg-primary text-white shadow-md' : 'hover:bg-surface-muted')}><span className="capitalize">{format(day, 'EEE', { locale: ptBR }).replace('.', '')}</span><span className="mt-1 text-base font-bold">{format(day, 'd')}</span></button>; })}
    </div>
  );
}

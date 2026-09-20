import { format } from 'date-fns';
import { agendaService } from '../services/agendaService';
import { useAsync } from './useAsync';

export function useAgenda(from: Date, to: Date) {
  const fromKey = format(from, 'yyyy-MM-dd');
  const toKey = format(to, 'yyyy-MM-dd');
  return useAsync(() => agendaService.list(fromKey, toKey), [fromKey, toKey]);
}

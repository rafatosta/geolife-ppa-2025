import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatMoney = (value: number) => brl.format(value);

export const formatLongDate = (value: Date | string) =>
  format(typeof value === 'string' ? new Date(`${value}T12:00:00`) : value, "d 'de' MMMM", { locale: ptBR });

export const formatRequestDate = (value: string) =>
  format(new Date(value), "d 'de' MMMM, HH:mm", { locale: ptBR });

export const formatShortDate = (value: string) => format(new Date(value), 'dd/MM', { locale: ptBR });

export const formatTime = (value: string | null) => value?.slice(0, 5).replace(':00', 'h') ?? '';

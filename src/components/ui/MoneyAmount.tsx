import { cn } from '../../lib/cn';
import { formatMoney } from '../../utils/format';

export function MoneyAmount({ value, className, negative }: { value: number; className?: string; negative?: boolean }) {
  return <span className={cn('tabular-nums', negative && 'text-danger', className)}>{negative ? '-' : ''}{formatMoney(value)}</span>;
}

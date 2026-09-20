import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react';
import { Button } from './Button';

export function LoadingState({ label = 'Carregando…' }: { label?: string }) {
  return <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-sm text-ink-secondary"><LoaderCircle className="size-6 animate-spin text-primary" aria-hidden /><span>{label}</span></div>;
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border p-6 text-center"><Inbox className="size-7 text-ink-secondary" aria-hidden /><p className="font-semibold">{title}</p>{description && <p className="text-sm text-ink-secondary">{description}</p>}</div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div role="alert" className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-card bg-danger-soft p-6 text-center text-danger"><AlertCircle className="size-7" aria-hidden /><p className="font-semibold">{message}</p>{onRetry && <Button variant="danger" onClick={onRetry}>Tentar novamente</Button>}</div>;
}

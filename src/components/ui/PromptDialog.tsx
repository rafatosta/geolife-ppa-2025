import * as Dialog from '@radix-ui/react-dialog';
import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { IconButton } from './IconButton';

export function PromptDialog({ trigger, title, description, confirmLabel, onConfirm, optional = true }: {
  trigger: ReactNode; title: string; description: string; confirmLabel: string; optional?: boolean; onConfirm: (comment: string) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');

  const submit = async () => {
    await onConfirm(comment.trim());
    setComment('');
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-card bg-white p-6 shadow-2xl">
          <Dialog.Title className="pr-10 text-lg font-bold">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-ink-secondary">{description}</Dialog.Description>
          <label className="mt-5 block text-sm font-semibold" htmlFor="dialog-comment">Motivo {optional && <span className="font-normal text-ink-secondary">(opcional)</span>}</label>
          <textarea id="dialog-comment" value={comment} onChange={(event) => setComment(event.target.value)} className="mt-2 min-h-24 w-full resize-none rounded-control border bg-white p-3 text-sm" maxLength={300} />
          <div className="mt-5 flex justify-end gap-2"><Dialog.Close asChild><Button variant="ghost">Cancelar</Button></Dialog.Close><Button variant="danger" onClick={submit} disabled={!optional && !comment.trim()}>{confirmLabel}</Button></div>
          <Dialog.Close asChild><IconButton aria-label="Fechar" className="absolute right-4 top-4"><X className="size-5" /></IconButton></Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

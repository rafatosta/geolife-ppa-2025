import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '../../lib/cn';

export function Avatar({ src, name, className }: { src?: string | null; name: string; className?: string }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?';
  return (
    <AvatarPrimitive.Root className={cn('inline-flex size-10 shrink-0 overflow-hidden rounded-full bg-primary-soft', className)}>
      <AvatarPrimitive.Image className="size-full object-cover" src={src ?? undefined} alt={`Foto de ${name}`} />
      <AvatarPrimitive.Fallback className="flex size-full items-center justify-center text-xs font-bold text-primary-dark" delayMs={300}>
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

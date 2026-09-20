import * as ProgressPrimitive from '@radix-ui/react-progress';

export function ProgressBar({ value }: { value: number }) {
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <ProgressPrimitive.Root className="relative h-2.5 overflow-hidden rounded-full bg-primary-soft" value={safeValue}>
      <ProgressPrimitive.Indicator className="h-full rounded-full bg-primary transition-transform" style={{ transform: `translateX(-${100 - safeValue}%)` }} />
    </ProgressPrimitive.Root>
  );
}

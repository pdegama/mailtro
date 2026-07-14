import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export function Surface({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[2rem] border border-ink/8 bg-white/76 shadow-[0_24px_80px_-56px_rgba(11,18,32,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-white/8 dark:shadow-black/20',
        className
      )}
      {...props}
    />
  );
}

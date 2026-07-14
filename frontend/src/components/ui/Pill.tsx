import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type PillProps = {
  children: ReactNode;
  className?: string;
};

export function Pill({ children, className }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded-full bg-ink/6 px-3 text-xs font-bold text-ink/70 dark:bg-white/10 dark:text-white/70',
        className
      )}
    >
      {children}
    </span>
  );
}

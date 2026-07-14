import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: ReactNode;
  active?: boolean;
};

export function IconButton({ className, label, icon, active, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'grid size-10 place-items-center rounded-full text-ink/65 transition duration-200 hover:-translate-y-0.5 hover:bg-ink/6 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky dark:text-white/65 dark:hover:bg-white/10 dark:hover:text-white',
        active && 'bg-ink text-white hover:bg-ink hover:text-white dark:bg-white dark:text-ink',
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
}

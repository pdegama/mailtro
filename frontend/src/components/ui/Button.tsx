import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-ink text-white shadow-[0_16px_32px_-18px_rgba(11,18,32,0.7)] hover:-translate-y-0.5 hover:bg-ink/90 dark:bg-white dark:text-ink dark:hover:bg-white/90',
  secondary:
    'bg-white/80 text-ink ring-1 ring-ink/10 hover:-translate-y-0.5 hover:bg-white dark:bg-white/10 dark:text-white dark:ring-white/10 dark:hover:bg-white/15',
  ghost:
    'bg-transparent text-ink/70 hover:bg-ink/5 hover:text-ink dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white',
  danger:
    'bg-coral text-white shadow-[0_16px_32px_-18px_rgba(255,91,91,0.8)] hover:-translate-y-0.5 hover:bg-coral/90',
};

export function Button({
  className,
  variant = 'primary',
  icon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky',
        variants[variant],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes } from 'react';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/cn';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'outline', size = 'md', className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors select-none',
        size === 'sm' ? 'h-7 px-2.5 text-[12.5px]' : 'h-8 px-3 text-[13px]',
        variant === 'primary' &&
          'bg-accent text-white hover:bg-accent/90 shadow-sm',
        variant === 'outline' &&
          'border border-line bg-surface hover:bg-canvas text-ink',
        variant === 'ghost' && 'text-ink-2 hover:bg-line/50 hover:text-ink',
        variant === 'danger' && 'text-bad hover:bg-bad/10',
        className
      )}
      {...props}
    />
  );
});

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-9 w-full rounded-md border border-line bg-surface px-3 text-[13.5px] text-ink',
        'transition-shadow focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/60',
        className
      )}
      {...props}
    />
  );
});

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-ink-2">{label}</span>
      {children}
    </label>
  );
}

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title="Copy"
      onClick={() => {
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
      className="rounded p-1 text-ink-3 hover:bg-line/60 hover:text-ink"
    >
      {copied ? <Check size={13} className="text-good" /> : <Copy size={13} />}
    </button>
  );
}

export function StatusDot({ tone }: { tone: 'good' | 'warn' | 'bad' | 'muted' }) {
  return (
    <span
      className={cn(
        'inline-block size-1.5 rounded-full',
        tone === 'good' && 'bg-good',
        tone === 'warn' && 'bg-warn',
        tone === 'bad' && 'bg-bad',
        tone === 'muted' && 'bg-ink-3'
      )}
    />
  );
}

import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

type BrandMarkProps = {
  open?: boolean;
  onClick?: () => void;
};

export function BrandMark({ open, onClick }: BrandMarkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex min-h-11 items-center gap-3 rounded-full border border-ink/8 bg-white/70 px-3 text-ink shadow-sm backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-white dark:hover:bg-white/12"
      aria-label="Open navigation menu"
    >
      <span className="grid size-8 place-items-center rounded-full bg-ink text-[0.72rem] font-black uppercase text-white dark:bg-white dark:text-ink">
        mt
      </span>
      <span className="hidden text-sm font-black uppercase tracking-wide sm:inline">Mailtro</span>
      <ChevronDown className={cn('size-4 text-ink/45 transition dark:text-white/45', open && 'rotate-180')} />
    </button>
  );
}

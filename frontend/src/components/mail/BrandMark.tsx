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
      className="group inline-flex min-h-10 items-center gap-2.5 rounded-full border border-ink/8 bg-white/80 px-3 text-ink shadow-sm backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-white dark:hover:bg-white/12 sm:min-h-11"
      aria-label="Open navigation menu"
      aria-expanded={open}
    >
      <span className="grid size-7 place-items-center rounded-full bg-ink text-[0.65rem] font-black uppercase text-white dark:bg-white dark:text-ink sm:size-8 sm:text-[0.72rem]">
        mt
      </span>
      <span className="hidden text-sm font-black tracking-wide sm:inline">Mailtro</span>
      <ChevronDown
        className={cn(
          'size-4 text-ink/40 transition dark:text-white/40',
          open && 'rotate-180'
        )}
      />
    </button>
  );
}

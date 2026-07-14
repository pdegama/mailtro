import { Command, Search } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { ThemeToggle } from '../ui/ThemeToggle';

type UtilityChromeProps = {
  theme: 'light' | 'dark';
  menuOpen: boolean;
  onMenuToggle: () => void;
  onThemeToggle: () => void;
};

export function UtilityChrome({ theme, menuOpen, onMenuToggle, onThemeToggle }: UtilityChromeProps) {
  return (
    <header className="relative z-30 grid h-16 grid-cols-[1fr_auto_1fr] items-center px-1 sm:px-3">
      <button
        type="button"
        className="inline-flex min-h-11 w-fit items-center gap-3 rounded-2xl border border-transparent px-3 text-sm font-black text-ink/72 transition hover:border-ink/8 hover:bg-white/70 hover:text-ink dark:text-white/72 dark:hover:border-white/10 dark:hover:bg-white/8 dark:hover:text-white"
      >
        <Search className="size-5" />
        <span className="hidden sm:inline">Search mail</span>
        <kbd className="hidden rounded-lg bg-ink/6 px-2 py-1 text-[11px] font-black text-ink/42 dark:bg-white/10 dark:text-white/42 md:inline">
          /
        </kbd>
      </button>

      <BrandMark open={menuOpen} onClick={onMenuToggle} />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onMenuToggle}
          className="hidden min-h-10 items-center gap-2 rounded-full border border-ink/8 bg-white/60 px-3 text-xs font-semibold uppercase tracking-wide text-ink/60 transition hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-white/60 dark:hover:bg-white/12 md:inline-flex"
        >
          <Command className="size-4" />
          Menu
        </button>
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        <div className="grid size-10 place-items-center rounded-full bg-ink/8 text-sm font-bold text-ink ring-1 ring-ink/8 dark:bg-white/10 dark:text-white dark:ring-white/10">
          J
        </div>
      </div>
    </header>
  );
}

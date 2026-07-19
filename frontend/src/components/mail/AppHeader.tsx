import { LogOut, PenLine, Search, X } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

type AppHeaderProps = {
  theme: 'light' | 'dark';
  searchOpen: boolean;
  searchQuery: string;
  userInitials: string;
  userName?: string;
  onThemeToggle: () => void;
  onCompose: () => void;
  onLogout: () => void;
  onSearchOpen: (open: boolean) => void;
  onSearchQuery: (query: string) => void;
};

export function AppHeader({
  theme,
  searchOpen,
  searchQuery,
  userInitials,
  userName,
  onThemeToggle,
  onCompose,
  onLogout,
  onSearchOpen,
  onSearchQuery,
}: AppHeaderProps) {
  if (searchOpen) {
    return (
      <div className="flex h-14 items-center gap-2">
        <label className="flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-full border border-ink/10 bg-white px-3 shadow-sm dark:border-white/12 dark:bg-white/8">
          <Search className="size-4 shrink-0 text-ink/40 dark:text-white/40" />
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => onSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onSearchOpen(false);
                onSearchQuery('');
              }
            }}
            placeholder="Search mail…"
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-ink/35 dark:text-white dark:placeholder:text-white/35"
            aria-label="Search mail"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchQuery('')}
              className="grid size-7 place-items-center rounded-full text-ink/40 hover:bg-ink/5 dark:text-white/40 dark:hover:bg-white/10"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </label>
        <button
          type="button"
          onClick={() => {
            onSearchOpen(false);
            onSearchQuery('');
          }}
          className="shrink-0 px-2 text-sm font-semibold text-ink/55 hover:text-ink dark:text-white/55 dark:hover:text-white"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-14 items-center gap-2">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-[10px] font-black uppercase text-white dark:bg-white dark:text-ink">
          mt
        </span>
        <span className="truncate text-sm font-black tracking-tight">Mailtro</span>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onSearchOpen(true)}
          className="grid size-9 place-items-center rounded-full text-ink/55 transition hover:bg-ink/5 hover:text-ink dark:text-white/55 dark:hover:bg-white/8 dark:hover:text-white"
          aria-label="Search"
          title="Search (/)"
        >
          <Search className="size-4" />
        </button>

        <button
          type="button"
          onClick={onCompose}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-ink px-3 text-sm font-semibold text-white transition hover:bg-ink/90 dark:bg-white dark:text-ink dark:hover:bg-white/92"
        >
          <PenLine className="size-3.5" />
          Compose
        </button>

        <ThemeToggle theme={theme} onToggle={onThemeToggle} />

        <div className="group relative">
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full bg-ink/8 text-[11px] font-bold uppercase text-ink ring-1 ring-ink/8 transition hover:bg-ink/12 dark:bg-white/10 dark:text-white dark:ring-white/10"
            title={userName ?? 'Account'}
            aria-label="Account"
          >
            {userInitials}
          </button>
          <div className="invisible absolute right-0 top-full z-40 mt-2 w-40 translate-y-1 rounded-2xl border border-ink/8 bg-white p-1.5 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-white/10 dark:bg-[#1a2230]">
            {userName ? (
              <p className="truncate px-3 py-2 text-xs font-semibold text-ink/50 dark:text-white/50">
                {userName}
              </p>
            ) : null}
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-ink/70 transition hover:bg-ink/5 dark:text-white/70 dark:hover:bg-white/8"
            >
              <LogOut className="size-4" />
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

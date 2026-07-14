import { Bell, Command, Menu, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { ThemeToggle } from '../ui/ThemeToggle';

type TopBarProps = {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onCompose: () => void;
};

export function TopBar({ theme, onThemeToggle, onCompose }: TopBarProps) {
  return (
    <header className="flex items-center gap-3 rounded-[2rem] border border-ink/8 bg-white/70 p-2 shadow-[0_18px_54px_-44px_rgba(11,18,32,0.6)] backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
      <IconButton className="lg:hidden" label="Open menu" icon={<Menu className="size-5" />} />
      <div className="hidden items-center gap-2 rounded-full bg-ink/5 px-4 py-2 text-sm font-bold text-ink/45 dark:bg-white/10 dark:text-white/45 md:flex">
        <Search className="size-4" />
        <span>Search mail, people, receipts</span>
        <kbd className="ml-10 rounded-full bg-white px-2 py-1 text-[11px] text-ink/45 dark:bg-ink dark:text-white/45">
          /
        </kbd>
      </div>
      <div className="min-w-0 flex-1 md:hidden">
        <p className="m-0 truncate text-sm font-black">Mailtro</p>
      </div>
      <IconButton label="Command menu" icon={<Command className="size-5" />} />
      <IconButton label="Notifications" icon={<Bell className="size-5" />} />
      <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      <Button className="hidden sm:inline-flex" onClick={onCompose}>
        New mail
      </Button>
    </header>
  );
}

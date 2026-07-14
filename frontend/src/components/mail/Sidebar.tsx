import { PenLine } from 'lucide-react';
import { navItems } from '../../data/mail';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';
import { Surface } from '../ui/Surface';

type SidebarProps = {
  onCompose: () => void;
};

export function Sidebar({ onCompose }: SidebarProps) {
  return (
    <Surface className="hidden w-[252px] shrink-0 flex-col p-4 lg:flex">
      <div className="flex items-center gap-3 px-2 py-2">
        <div className="grid size-11 place-items-center rounded-2xl bg-mint text-lg font-black text-ink shadow-inner">
          M
        </div>
        <div>
          <p className="m-0 text-base font-black">Mailtro</p>
          <p className="m-0 text-xs font-bold text-ink/45 dark:text-white/45">Open mail cockpit</p>
        </div>
      </div>

      <Button className="mt-6 w-full" icon={<PenLine className="size-4" />} onClick={onCompose}>
        Compose
      </Button>

      <nav className="mt-6 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              'flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-extrabold text-ink/62 transition hover:bg-ink/5 hover:text-ink dark:text-white/62 dark:hover:bg-white/10 dark:hover:text-white',
              item.active && 'bg-ink text-white shadow-lg shadow-ink/10 hover:bg-ink hover:text-white dark:bg-white dark:text-ink dark:hover:bg-white'
            )}
            type="button"
          >
            <item.icon className="size-4" />
            <span className="flex-1">{item.label}</span>
            {item.count ? <span className="text-xs opacity-70">{item.count}</span> : null}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-[1.5rem] bg-lime/25 p-4 text-sm dark:bg-lime/10">
        <p className="m-0 font-black">Screen first</p>
        <p className="m-0 mt-2 text-xs leading-5 text-ink/55 dark:text-white/55">
          Unknown senders wait outside your Imbox until you approve them.
        </p>
      </div>
    </Surface>
  );
}

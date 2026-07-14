import {
  Archive,
  Clock3,
  CornerUpRight,
  MoreHorizontal,
  Paperclip,
} from 'lucide-react';
import type { MailItem } from '../../data/imbox';
import { MailAvatar } from './MailAvatar';

type MailRowProps = {
  item: MailItem;
};

export function MailRow({ item }: MailRowProps) {
  return (
    <button
      type="button"
      className="group grid w-full grid-cols-[10px_40px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-transparent px-2 py-3 text-left transition hover:border-ink/8 hover:bg-ink/[0.025] dark:hover:border-white/10 dark:hover:bg-white/[0.045]"
    >
      <span className="mx-auto block size-2 rounded-full bg-ink/18 dark:bg-white/24" />
      <MailAvatar initials={item.initials} color={item.avatarColor} badge={item.badge} />
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p className="m-0 truncate text-base font-semibold leading-tight text-ink dark:text-white">
            {item.subject}
          </p>
          {item.attachment ? <Paperclip className="size-4 shrink-0 text-ink/40 dark:text-white/45" /> : null}
        </div>
        <p className="m-0 truncate text-sm font-medium leading-6 text-ink/48 dark:text-white/48">
          <span>{item.sender}</span>
          <span> - </span>
          <span>{item.preview}</span>
        </p>
      </div>
      <div className="flex items-center gap-3 pl-2">
        <time className="text-sm font-medium text-ink/42 dark:text-white/44">{item.date}</time>
        <span className="hidden items-center gap-1 opacity-0 transition group-hover:opacity-100 lg:flex">
          <span className="grid size-8 place-items-center rounded-full bg-ink/[0.045] text-ink/50 dark:bg-white/8 dark:text-white/56">
            <Clock3 className="size-4" />
          </span>
          <span className="grid size-8 place-items-center rounded-full bg-ink/[0.045] text-ink/50 dark:bg-white/8 dark:text-white/56">
            <Archive className="size-4" />
          </span>
          <span className="grid size-8 place-items-center rounded-full bg-ink/[0.045] text-ink/50 dark:bg-white/8 dark:text-white/56">
            <CornerUpRight className="size-4" />
          </span>
          <span className="grid size-8 place-items-center rounded-full bg-ink/[0.045] text-ink/50 dark:bg-white/8 dark:text-white/56">
            <MoreHorizontal className="size-4" />
          </span>
        </span>
      </div>
    </button>
  );
}

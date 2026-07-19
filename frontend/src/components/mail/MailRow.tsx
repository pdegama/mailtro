import { Paperclip } from 'lucide-react';
import type { MailItem } from '../../data/imbox';
import { MailAvatar } from './MailAvatar';
import { cn } from '../../lib/cn';

type MailRowProps = {
  item: MailItem;
  onSelect?: (item: MailItem) => void;
};

export function MailRow({ item, onSelect }: MailRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(item)}
      className="group grid w-full grid-cols-[8px_36px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-xl border border-transparent px-2 py-2.5 text-left transition hover:border-ink/8 hover:bg-ink/[0.03] dark:hover:border-white/10 dark:hover:bg-white/[0.045]"
    >
      <span
        className={cn(
          'mx-auto block size-1.5 rounded-full',
          item.unread ? 'bg-coral' : 'bg-transparent'
        )}
      />
      <MailAvatar initials={item.initials} color={item.avatarColor} />
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-1.5">
          <p
            className={cn(
              'm-0 truncate text-[15px] leading-tight text-ink dark:text-white',
              item.unread ? 'font-bold' : 'font-semibold'
            )}
          >
            {item.subject}
          </p>
          {item.attachment ? (
            <Paperclip className="size-3.5 shrink-0 text-ink/35 dark:text-white/40" />
          ) : null}
        </div>
        <p className="m-0 truncate text-[13px] font-medium leading-5 text-ink/48 dark:text-white/48">
          <span className={item.unread ? 'font-semibold text-ink/62 dark:text-white/62' : undefined}>
            {item.sender}
          </span>
          <span> — </span>
          <span>{item.preview}</span>
        </p>
      </div>
      <time className="shrink-0 pl-1 text-xs font-medium text-ink/40 dark:text-white/42">
        {item.date}
      </time>
    </button>
  );
}

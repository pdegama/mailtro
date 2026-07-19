import { Reply } from 'lucide-react';
import type { MailItem } from '../../data/imbox';
import { MailAvatar } from './MailAvatar';

type MailReaderProps = {
  item: MailItem;
  onReply: (item: MailItem) => void;
};

/** Read a message — same padding/typography as the compose surface. */
export function MailReader({ item, onReply }: MailReaderProps) {
  const body =
    item.body ??
    `${item.preview}\n\n—\nThis is a preview of the message from ${item.sender}.`;

  return (
    <article className="px-1 pb-4">
      <div className="flex items-start gap-3 border-b border-ink/8 pb-4 dark:border-white/10">
        <MailAvatar initials={item.initials} color={item.avatarColor} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="m-0 truncate text-[15px] font-bold text-ink dark:text-white">{item.sender}</p>
            <time className="ml-auto shrink-0 text-xs font-medium text-ink/42 dark:text-white/44">
              {item.date}
            </time>
          </div>
          {item.email ? (
            <p className="m-0 mt-0.5 truncate text-sm font-medium text-ink/45 dark:text-white/45">
              {item.email}
            </p>
          ) : (
            <p className="m-0 mt-0.5 text-sm font-medium text-ink/45 dark:text-white/45">to you</p>
          )}
        </div>
      </div>

      <div className="mt-5 whitespace-pre-wrap text-[15px] leading-7 text-ink/80 dark:text-white/78">
        {body}
      </div>

      <div className="mt-8 flex items-center gap-2 border-t border-ink/8 pt-4 dark:border-white/10">
        <button
          type="button"
          onClick={() => onReply(item)}
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white transition hover:bg-ink/88 dark:bg-white dark:text-ink dark:hover:bg-white/92"
        >
          <Reply className="size-4" />
          Reply
        </button>
      </div>
    </article>
  );
}

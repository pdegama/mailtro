import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { screenerItems } from '../../data/imbox';
import { MailAvatar } from './MailAvatar';

export function ScreenerList() {
  return (
    <section className="mx-auto max-w-3xl py-3">
      <p className="m-0 text-sm font-semibold leading-6 text-ink/55 dark:text-white/55">
        New senders land here before they can reach Focus Mail. Approve trusted sources and block the rest.
      </p>
      <div className="mt-5 space-y-3">
        {screenerItems.map((sender) => (
          <div
            key={sender.id}
            className="grid gap-3 rounded-2xl border border-ink/8 bg-white/56 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.045] sm:grid-cols-[48px_minmax(0,1fr)_auto]"
          >
            <MailAvatar initials={sender.initials} color={sender.avatarColor} />
            <div className="min-w-0">
              <p className="m-0 truncate text-base font-black text-ink dark:text-white">{sender.sender}</p>
              <p className="m-0 truncate text-xs font-bold text-ink/40 dark:text-white/40">{sender.email}</p>
              <p className="m-0 mt-2 text-sm leading-6 text-ink/58 dark:text-white/58">{sender.preview}</p>
            </div>
            <div className="flex items-center gap-2 sm:flex-col sm:items-stretch">
              <button
                type="button"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-ink px-3 text-sm font-black text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-ink"
              >
                <ThumbsUp className="size-4" />
                Approve
              </button>
              <button
                type="button"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-ink/12 px-3 text-sm font-black text-ink/60 transition hover:-translate-y-0.5 hover:border-coral hover:text-coral dark:border-white/12 dark:text-white/60"
              >
                <ThumbsDown className="size-4" />
                Block
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

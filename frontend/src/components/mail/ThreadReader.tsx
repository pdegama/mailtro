import { Archive, Forward, MailCheck, MoreHorizontal, Reply, ShieldCheck, Sparkles, Star } from 'lucide-react';
import type { MailThread } from '../../data/mail';
import { quickActions } from '../../data/mail';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Pill } from '../ui/Pill';
import { Surface } from '../ui/Surface';

type ThreadReaderProps = {
  thread: MailThread;
  onCompose: () => void;
};

export function ThreadReader({ thread, onCompose }: ThreadReaderProps) {
  return (
    <Surface className="flex min-h-[520px] flex-1 flex-col overflow-hidden">
      <div className="border-b border-ink/8 p-5 dark:border-white/10 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Pill>{thread.tag}</Pill>
          {thread.important ? <Pill className="bg-coral/14 text-coral">Priority</Pill> : null}
          <span className="ml-auto text-sm font-bold text-ink/45 dark:text-white/45">{thread.time}</span>
        </div>
        <h1 className="m-0 mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
          {thread.subject}
        </h1>
        <div className="mt-5 flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-mint to-sky font-black text-ink">
            {thread.initials}
          </div>
          <div>
            <p className="m-0 font-black">{thread.sender}</p>
            <p className="m-0 text-sm font-bold text-ink/45 dark:text-white/45">to you and Mailtro Team</p>
          </div>
        </div>
      </div>

      <article className="flex-1 p-5 dark:text-white/86 sm:p-7">
        <p className="m-0 max-w-3xl text-lg leading-8 text-ink/74 dark:text-white/74">{thread.body}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="flex min-h-20 items-center gap-3 rounded-[1.4rem] border border-ink/8 bg-ink/4 px-4 text-left text-sm font-black transition hover:-translate-y-0.5 hover:bg-ink/7 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/12"
            >
              <action.icon className="size-5 text-sky" />
              {action.label}
            </button>
          ))}
        </div>
      </article>

      <div className="flex flex-wrap items-center gap-2 border-t border-ink/8 p-4 dark:border-white/10">
        <Button icon={<Reply className="size-4" />} onClick={onCompose}>
          Reply
        </Button>
        <Button variant="secondary" icon={<Forward className="size-4" />}>
          Forward
        </Button>
        <div className="ml-auto flex items-center gap-1">
          <IconButton label="Archive" icon={<Archive className="size-5" />} />
          <IconButton label="Mark done" icon={<MailCheck className="size-5" />} />
          <IconButton label="Screen sender" icon={<ShieldCheck className="size-5" />} />
          <IconButton label="Star" icon={<Star className="size-5" />} />
          <IconButton label="Summarize" icon={<Sparkles className="size-5" />} />
          <IconButton label="More actions" icon={<MoreHorizontal className="size-5" />} />
        </div>
      </div>
    </Surface>
  );
}

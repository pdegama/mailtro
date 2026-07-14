import { motion } from 'framer-motion';
import type { MailThread } from '../../data/mail';
import { cn } from '../../lib/cn';
import { Pill } from '../ui/Pill';

type ThreadListProps = {
  threads: MailThread[];
  activeId: string;
  onSelect: (id: string) => void;
};

const toneClasses: Record<MailThread['tone'], string> = {
  work: 'bg-sky/18 text-sky',
  personal: 'bg-lime/30 text-emerald-700 dark:text-lime',
  billing: 'bg-gold/28 text-amber-700 dark:text-gold',
  system: 'bg-coral/14 text-coral',
};

export function ThreadList({ threads, activeId, onSelect }: ThreadListProps) {
  return (
    <div className="space-y-3">
      {threads.map((thread, index) => (
        <motion.button
          key={thread.id}
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 * index, duration: 0.28 }}
          type="button"
          onClick={() => onSelect(thread.id)}
          className={cn(
            'w-full rounded-[1.5rem] border p-4 text-left transition duration-200 hover:-translate-y-0.5',
            activeId === thread.id
              ? 'border-ink bg-ink text-white shadow-[0_24px_60px_-36px_rgba(11,18,32,0.85)] dark:border-white dark:bg-white dark:text-ink'
              : 'border-ink/8 bg-white/76 hover:border-ink/18 dark:border-white/10 dark:bg-white/8 dark:hover:border-white/18'
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'grid size-11 shrink-0 place-items-center rounded-2xl text-sm font-black',
                activeId === thread.id ? 'bg-white/16 dark:bg-ink/10' : 'bg-ink/6 dark:bg-white/10'
              )}
            >
              {thread.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="m-0 truncate text-sm font-black">{thread.sender}</p>
                {thread.unread ? <span className="size-2 rounded-full bg-coral" /> : null}
                <span className="ml-auto shrink-0 text-xs font-bold opacity-55">{thread.time}</span>
              </div>
              <p className="m-0 mt-1 truncate text-sm font-extrabold">{thread.subject}</p>
              <p className="m-0 mt-2 line-clamp-2 text-sm leading-5 opacity-58">{thread.preview}</p>
              <Pill className={cn('mt-3', activeId === thread.id ? 'bg-white/14 text-white dark:bg-ink/8 dark:text-ink' : toneClasses[thread.tone])}>
                {thread.tag}
              </Pill>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

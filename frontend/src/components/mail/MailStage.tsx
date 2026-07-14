import type { ReactNode } from 'react';
import { PenLine, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/cn';

type MailStageProps = {
  title: string;
  children: ReactNode;
  onCompose: () => void;
  badge?: string;
  className?: string;
};

export function MailStage({ title, children, onCompose, badge, className }: MailStageProps) {
  return (
    <section
      className={cn(
        'mx-auto mt-5 w-full max-w-[1000px] overflow-hidden rounded-[1.5rem] border border-ink/8 bg-white shadow-[0_24px_80px_-70px_rgba(18,24,38,0.45)] dark:border-white/10 dark:bg-[#1c2532] dark:shadow-black/20',
        className
      )}
    >
      <div className="relative px-5 pb-8 pt-5 sm:px-10 sm:pt-8">
        <div className="mb-2 flex min-h-11 items-center justify-between gap-3">
          {badge ? (
            <button
              type="button"
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-ink/10 bg-ink/[0.025] px-3 text-sm font-semibold text-ink/64 transition hover:bg-ink/[0.045] dark:border-white/10 dark:bg-white/[0.045] dark:text-white/64"
            >
              <ShieldCheck className="size-4" />
              {badge}
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onCompose}
            className="inline-flex min-h-9 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white transition hover:bg-ink/88 dark:bg-white dark:text-ink dark:hover:bg-white/90"
          >
            <PenLine className="size-4" />
            Compose
          </button>
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <h1 className="m-0 text-4xl font-black tracking-tight text-ink dark:text-white sm:text-5xl">
            {title}
          </h1>
        </div>

        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

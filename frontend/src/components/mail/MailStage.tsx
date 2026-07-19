import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/cn';

type MailStageProps = {
  title: string;
  children: ReactNode;
  reading?: boolean;
  onBack?: () => void;
  readerTitle?: string;
  emptyMessage?: string;
};

/** Main mail card — same surface language as the compose drawer. */
export function MailStage({
  title,
  children,
  reading,
  onBack,
  readerTitle,
  emptyMessage,
}: MailStageProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.25rem] border border-ink/8 bg-white shadow-[0_16px_50px_-42px_rgba(18,24,38,0.5)] dark:border-white/10 dark:bg-[#141a24] dark:shadow-black/40">
      <div className="shrink-0 border-b border-ink/6 px-4 pb-3.5 pt-4 dark:border-white/8">
        {reading ? (
          <div className="mb-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-ink/10 bg-ink/[0.03] px-3 text-sm font-semibold text-ink/70 transition hover:bg-ink/[0.06] dark:border-white/10 dark:bg-white/[0.05] dark:text-white/70"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
          </div>
        ) : null}

        <div className="text-center">
          <h1
            className={cn(
              'm-0 font-black tracking-tight text-ink dark:text-white',
              reading ? 'text-lg leading-snug' : 'text-[2rem] leading-tight'
            )}
          >
            {reading ? readerTitle : title}
          </h1>
          {emptyMessage && !reading ? (
            <p className="m-0 mt-2 text-sm font-medium text-ink/45 dark:text-white/45">{emptyMessage}</p>
          ) : null}
        </div>
      </div>

      <div className="mail-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
        {children}
      </div>
    </section>
  );
}

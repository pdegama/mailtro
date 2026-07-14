import type { ReactNode } from 'react';

type SectionHeaderProps = {
  title: string;
  action?: ReactNode;
};

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h2 className="m-0 shrink-0 text-xs font-bold uppercase tracking-wide text-ink/66 dark:text-white/66">
        {title}
      </h2>
      <div className="h-px flex-1 bg-ink/10 dark:bg-white/10" />
      {action ? (
        <button
          type="button"
          className="shrink-0 rounded-full border border-ink/10 px-3 py-1.5 text-xs font-semibold text-ink/56 transition hover:bg-ink/[0.045] hover:text-ink dark:border-white/10 dark:text-white/56 dark:hover:bg-white/8 dark:hover:text-white"
        >
          {action}
        </button>
      ) : null}
    </div>
  );
}

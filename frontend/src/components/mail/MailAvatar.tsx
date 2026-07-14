import { cn } from '../../lib/cn';

type MailAvatarProps = {
  initials: string;
  color?: string;
  badge?: string;
};

export function MailAvatar({ initials, badge }: MailAvatarProps) {
  return (
    <div className="relative grid size-10 shrink-0 place-items-center">
      <span
        className={cn(
          'grid size-10 place-items-center rounded-full bg-ink/[0.065] text-xs font-bold uppercase text-ink/72 dark:bg-white/10 dark:text-white/72'
        )}
      >
        {initials}
      </span>
      {badge ? (
        <span className="absolute -bottom-1 -right-1 rounded-md border border-white bg-ink/70 px-1.5 py-0.5 text-[8px] font-bold uppercase text-white dark:border-[#1c2532]">
          {badge}
        </span>
      ) : null}
    </div>
  );
}

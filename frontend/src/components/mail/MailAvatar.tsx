import { cn } from '../../lib/cn';

type MailAvatarProps = {
  initials: string;
  color?: string;
};

export function MailAvatar({ initials, color }: MailAvatarProps) {
  return (
    <span
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-bold uppercase text-ink/80 dark:text-white/85',
        color ? `bg-gradient-to-br ${color}` : 'bg-ink/[0.07] dark:bg-white/10'
      )}
    >
      {initials}
    </span>
  );
}

import type { Mail } from '../../api/types';
import { cn } from '../../lib/cn';
import { StatusDot } from '../ui/primitives';

function timeLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const SENT_STATUS: Record<string, { label: string; tone: 'good' | 'warn' | 'bad' | 'muted' }> = {
  queued: { label: 'Sending', tone: 'muted' },
  tryagain: { label: 'Retrying', tone: 'warn' },
  delivered: { label: 'Delivered', tone: 'good' },
  failed: { label: 'Failed', tone: 'bad' },
};

type Props = {
  mail: Mail;
  mailbox: 'inbox' | 'sent';
  onOpen: () => void;
};

export function MailRow({ mail, mailbox, onOpen }: Props) {
  const who =
    mailbox === 'sent'
      ? mail.to_address
      : mail.from_name || mail.from_address.split('@')[0] || mail.from_address;
  const sentStatus = mailbox === 'sent' ? SENT_STATUS[mail.status] : undefined;

  return (
    <button
      onClick={onOpen}
      className={cn(
        'group flex w-full items-center gap-3 border-b border-line/60 px-4 py-2.5 text-left last:border-0',
        'transition-colors hover:bg-accent-soft/40'
      )}
    >
      {/* unread marker */}
      <span
        className={cn(
          'size-1.5 shrink-0 rounded-full',
          mailbox === 'inbox' && mail.unread ? 'bg-accent' : 'bg-transparent'
        )}
      />

      <span
        className={cn(
          'w-[150px] shrink-0 truncate text-[13px]',
          mail.unread && mailbox === 'inbox' ? 'font-semibold text-ink' : 'text-ink-2'
        )}
        title={mailbox === 'sent' ? mail.to_address : mail.from_address}
      >
        {who}
      </span>

      <span className="min-w-0 flex-1 truncate text-[13px]">
        <span
          className={cn(
            mail.unread && mailbox === 'inbox' ? 'font-semibold text-ink' : 'text-ink'
          )}
        >
          {mail.subject || '(no subject)'}
        </span>
        {mail.snippet && <span className="text-ink-3"> — {mail.snippet}</span>}
      </span>

      {mail.tag && (
        <span className="shrink-0 rounded bg-line/60 px-1.5 py-0.5 text-[10.5px] font-medium text-ink-2">
          +{mail.tag}
        </span>
      )}

      {sentStatus && (
        <span className="flex shrink-0 items-center gap-1.5 text-[11.5px] text-ink-3">
          <StatusDot tone={sentStatus.tone} /> {sentStatus.label}
        </span>
      )}

      <span className="w-[52px] shrink-0 text-right text-[11.5px] tabular-nums text-ink-3">
        {timeLabel(mail.created_at)}
      </span>
    </button>
  );
}

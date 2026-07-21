import { useEffect } from 'react';
import { Drawer } from 'vaul';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MailQuestion, Reply, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { fetchMail, markUnread } from '../../api/mail';
import type { Mail } from '../../api/types';
import { cn } from '../../lib/cn';
import { Button } from '../ui/primitives';

type Props = {
  mailId: number | null;
  onClose: () => void;
  onReply: (mail: Mail) => void;
};

function AuthBadge({ kind, status }: { kind: 'SPF' | 'DKIM'; status: string }) {
  const s = (status || 'NONE').toUpperCase();
  const pass = s === 'PASS';
  const none = s === 'NONE' || s === '';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium',
        pass && 'bg-good/10 text-good',
        !pass && !none && 'bg-bad/10 text-bad',
        none && 'bg-line/60 text-ink-3'
      )}
      title={`${kind}: ${s}`}
    >
      {pass ? <ShieldCheck size={11} /> : <ShieldAlert size={11} />}
      {kind} {s.toLowerCase()}
    </span>
  );
}

export function ReaderDrawer({ mailId, onClose, onReply }: Props) {
  const queryClient = useQueryClient();
  const open = mailId !== null;

  const { data: mail, isLoading } = useQuery({
    queryKey: ['mail', mailId],
    queryFn: () => fetchMail(mailId!),
    enabled: open,
  });

  // opening marks the mail read server-side — refresh list badges
  useEffect(() => {
    if (mail) {
      queryClient.invalidateQueries({ queryKey: ['mails'] });
    }
  }, [mail, queryClient]);

  async function handleMarkUnread() {
    if (!mail) return;
    await markUnread(mail.id);
    queryClient.invalidateQueries({ queryKey: ['mails'] });
    queryClient.removeQueries({ queryKey: ['mail', mail.id] });
    onClose();
  }

  return (
    <Drawer.Root open={open} onOpenChange={(v) => !v && onClose()} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/30" />
        <Drawer.Content
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[640px] flex-col border-l border-line bg-canvas shadow-2xl"
          aria-describedby={undefined}
        >
          {isLoading || !mail ? (
            <div className="grid flex-1 place-items-center text-[13px] text-ink-3">Loading…</div>
          ) : (
            <>
              <header className="border-b border-line px-6 py-4">
                <div className="flex items-start justify-between gap-3">
                  <Drawer.Title className="text-[17px] font-semibold leading-snug tracking-tight">
                    {mail.subject || '(no subject)'}
                  </Drawer.Title>
                  <button
                    onClick={onClose}
                    className="rounded-md p-1.5 text-ink-3 hover:bg-line/50 hover:text-ink"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px]">
                  <span className="font-medium">
                    {mail.from_name || mail.from_address.split('@')[0]}
                  </span>
                  <span className="text-ink-3">{mail.from_address}</span>
                  <span className="text-ink-3">→ {mail.to_address}</span>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  {mail.mailbox === 'inbox' && (
                    <>
                      <AuthBadge kind="SPF" status={mail.spf_status} />
                      <AuthBadge kind="DKIM" status={mail.dkim_status} />
                    </>
                  )}
                  {mail.tag && (
                    <span className="rounded-full bg-line/60 px-2 py-0.5 text-[10.5px] font-medium text-ink-2">
                      +{mail.tag}
                    </span>
                  )}
                  <span className="text-[11.5px] text-ink-3">
                    {new Date(mail.created_at).toLocaleString()}
                  </span>
                </div>

                {mail.mailbox === 'sent' && mail.status_error && (
                  <p className="mt-2.5 whitespace-pre-wrap rounded-md border border-bad/25 bg-bad/8 px-3 py-2 text-[12px] text-bad">
                    {mail.status_error}
                  </p>
                )}
              </header>

              <div className="mail-scroll flex-1 overflow-y-auto">
                {mail.body_html ? (
                  <iframe
                    title="message"
                    sandbox=""
                    srcDoc={`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Inter,system-ui,sans-serif;font-size:14px;line-height:1.65;color:#24262d;margin:24px;word-break:break-word}img{max-width:100%}</style></head><body>${mail.body_html}</body></html>`}
                    className="h-full w-full border-0 bg-white"
                  />
                ) : (
                  <div className="mail-body whitespace-pre-wrap px-6 py-5 text-[13.5px]">
                    {mail.body_text || mail.snippet || '(empty message)'}
                  </div>
                )}
              </div>

              <footer className="flex items-center gap-2 border-t border-line px-6 py-3">
                <Button variant="primary" size="sm" onClick={() => onReply(mail)}>
                  <Reply size={13} /> Reply
                </Button>
                {mail.mailbox === 'inbox' && (
                  <Button variant="ghost" size="sm" onClick={handleMarkUnread}>
                    <MailQuestion size={13} /> Mark unread
                  </Button>
                )}
              </footer>
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

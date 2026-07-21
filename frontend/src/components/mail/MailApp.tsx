import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LogOut, Moon, PenLine, Search, Settings, Sun, X } from 'lucide-react';
import { fetchMails } from '../../api/mail';
import type { Mail } from '../../api/types';
import type { AuthSession } from '../../api/axiosClient';
import { cn } from '../../lib/cn';
import { BrandMark } from '../BrandMark';
import { Button } from '../ui/primitives';
import { MailRow } from './MailRow';
import { ReaderDrawer } from './ReaderDrawer';
import { Composer, type ComposerDraft } from './Composer';
import { SettingsDrawer } from './SettingsDrawer';

type Mailbox = 'inbox' | 'sent';

type Props = {
  session: AuthSession;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onLogout: () => void;
};

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const that = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((today.getTime() - that.getTime()) / 86_400_000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return d.toLocaleDateString(undefined, { weekday: 'long' });
  return d.toLocaleDateString(undefined, { month: 'long', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' });
}

export function MailApp({ session, theme, onThemeToggle, onLogout }: Props) {
  const [mailbox, setMailbox] = useState<Mailbox>('inbox');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [openMailId, setOpenMailId] = useState<number | null>(null);
  const [composeDraft, setComposeDraft] = useState<ComposerDraft | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const username = session.user?.username ?? '';

  const { data, isLoading } = useQuery({
    queryKey: ['mails', mailbox],
    queryFn: () => fetchMails(mailbox),
    refetchInterval: 15_000,
  });

  const mails = useMemo(() => {
    const list = data?.mails ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (m) =>
        m.subject.toLowerCase().includes(q) ||
        m.from_address.includes(q) ||
        m.from_name.toLowerCase().includes(q) ||
        m.to_address.includes(q) ||
        m.snippet.toLowerCase().includes(q)
    );
  }, [data, query]);

  // group rows by day for hey-style section breaks
  const grouped = useMemo(() => {
    const groups: { label: string; items: Mail[] }[] = [];
    for (const m of mails) {
      const label = dayLabel(m.created_at);
      const last = groups[groups.length - 1];
      if (last && last.label === label) last.items.push(m);
      else groups.push({ label, items: [m] });
    }
    return groups;
  }, [mails]);

  const unread = data?.unread ?? 0;

  function replyTo(mail: Mail) {
    setOpenMailId(null);
    setComposeDraft({
      to: mail.mailbox === 'sent' ? mail.to_address : mail.from_address,
      subject: mail.subject.startsWith('Re:') ? mail.subject : `Re: ${mail.subject}`,
      html: `<br/><br/><blockquote>${(mail.snippet || '').replace(/</g, '&lt;')}</blockquote>`,
    });
  }

  return (
    <div className="flex h-full flex-col bg-canvas">
      {/* top bar — compact, linear-like */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-line px-4">
        <div className="flex items-center gap-3">
          <BrandMark />
        </div>

        <nav className="flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5">
          {(['inbox', 'sent'] as const).map((box) => (
            <button
              key={box}
              onClick={() => setMailbox(box)}
              className={cn(
                'rounded-md px-3 py-1 text-[12.5px] font-medium capitalize transition-colors',
                mailbox === box ? 'bg-accent-soft text-accent' : 'text-ink-2 hover:text-ink'
              )}
            >
              {box}
              {box === 'inbox' && unread > 0 && (
                <span className="ml-1.5 rounded-full bg-accent px-1.5 text-[10.5px] font-semibold text-white">
                  {unread}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setSearchOpen((v) => !v);
              if (searchOpen) setQuery('');
            }}
            className="rounded-md p-2 text-ink-3 hover:bg-line/50 hover:text-ink"
            title="Search"
          >
            {searchOpen ? <X size={15} /> : <Search size={15} />}
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="rounded-md p-2 text-ink-3 hover:bg-line/50 hover:text-ink"
            title="Settings & domains"
          >
            <Settings size={15} />
          </button>
          <button
            onClick={onThemeToggle}
            className="rounded-md p-2 text-ink-3 hover:bg-line/50 hover:text-ink"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={onLogout}
            className="rounded-md p-2 text-ink-3 hover:bg-line/50 hover:text-ink"
            title={`Sign out (${username})`}
          >
            <LogOut size={15} />
          </button>
          <Button
            variant="primary"
            size="sm"
            className="ml-2"
            onClick={() => setComposeDraft({ to: '', subject: '', html: '' })}
          >
            <PenLine size={13} /> Compose
          </Button>
        </div>
      </header>

      {searchOpen && (
        <div className="border-b border-line bg-surface px-4 py-2">
          <div className="mx-auto max-w-[680px]">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${mailbox}…`}
              className="h-8 w-full rounded-md border border-line bg-canvas px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>
      )}

      {/* hey-style centered list */}
      <main className="mail-scroll flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[680px] px-4 pb-24 pt-8">
          <div className="mb-4 flex items-end justify-between">
            <h1 className="text-[22px] font-bold capitalize tracking-tight">{mailbox}</h1>
            <span className="text-[12px] text-ink-3">
              {mailbox === 'inbox' && unread > 0 ? `${unread} unread` : `${mails.length} messages`}
            </span>
          </div>

          {isLoading ? (
            <p className="py-16 text-center text-[13px] text-ink-3">Loading…</p>
          ) : mails.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[14px] font-medium text-ink-2">
                {query ? 'Nothing matches your search.' : mailbox === 'inbox' ? 'Your inbox is clear.' : 'Nothing sent yet.'}
              </p>
              {!query && mailbox === 'inbox' && (
                <p className="mt-1 text-[12.5px] text-ink-3">
                  New mail lands here — make sure your domain is verified in Settings.
                </p>
              )}
            </div>
          ) : (
            grouped.map((group) => (
              <section key={group.label} className="mb-6">
                <h2 className="mb-1 px-1 text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">
                  {group.label}
                </h2>
                <div className="overflow-hidden rounded-xl border border-line bg-surface">
                  {group.items.map((mail) => (
                    <MailRow
                      key={mail.id}
                      mail={mail}
                      mailbox={mailbox}
                      onOpen={() => setOpenMailId(mail.id)}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>

      <ReaderDrawer
        mailId={openMailId}
        onClose={() => setOpenMailId(null)}
        onReply={replyTo}
      />

      {composeDraft && (
        <Composer
          username={username}
          draft={composeDraft}
          onClose={() => setComposeDraft(null)}
        />
      )}

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        username={username}
      />
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from './components/mail/AppShell';
import { AppHeader } from './components/mail/AppHeader';
import { ComposeDrawer, emptyDraft, type ComposeDraft } from './components/mail/ComposeDrawer';
import { MailList } from './components/mail/MailList';
import { MailReader } from './components/mail/MailReader';
import { MailStage } from './components/mail/MailStage';
import { AuthScreen } from './components/auth/AuthScreen';
import {
  clearAuthSession,
  getStoredAuthSession,
  type AuthSession,
} from './api/axiosClient';
import type { MailItem } from './data/imbox';
import { emails } from './data/imbox';

function initialsFromUser(session: AuthSession | null): string {
  const name = session?.user?.fullname || session?.user?.username || 'U';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return String(name).slice(0, 2).toUpperCase();
}

function replyDraft(item: MailItem): ComposeDraft {
  const subject = item.subject.startsWith('Re:') ? item.subject : `Re: ${item.subject}`;
  return {
    ...emptyDraft(),
    to: item.email ?? '',
    subject,
    body: `\n\n—\nOn ${item.date}, ${item.sender} wrote:\n> ${item.preview}`,
    mode: 'reply',
  };
}

function matchesQuery(item: MailItem, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    item.subject.toLowerCase().includes(q) ||
    item.sender.toLowerCase().includes(q) ||
    item.preview.toLowerCase().includes(q) ||
    (item.body?.toLowerCase().includes(q) ?? false) ||
    (item.email?.toLowerCase().includes(q) ?? false)
  );
}

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (window.localStorage.getItem('mailtro-theme') as 'light' | 'dark') || 'light';
  });
  const [composeOpen, setComposeOpen] = useState(false);
  const [draft, setDraft] = useState<ComposeDraft>(emptyDraft);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<MailItem | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(() => getStoredAuthSession());
  /** Local sent mail appears at the top of the single list. */
  const [sentMail, setSentMail] = useState<MailItem[]>([]);

  const isAuthenticated = Boolean(session?.token);

  const allMail = useMemo(() => [...sentMail, ...emails], [sentMail]);

  const visibleMail = useMemo(
    () => allMail.filter((item) => matchesQuery(item, searchQuery)),
    [allMail, searchQuery]
  );

  const searchEmpty = Boolean(searchQuery.trim()) && visibleMail.length === 0;

  useEffect(() => {
    setSessionReady(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    window.localStorage.setItem('mailtro-theme', theme);
  }, [theme]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setSearchOpen(true);
        return;
      }

      if (typing) return;

      if (event.key.toLowerCase() === 'c' && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        openNewCompose();
      }
      if (event.key === 'Escape') {
        if (searchOpen) {
          setSearchOpen(false);
          setSearchQuery('');
        } else if (selected) {
          setSelected(null);
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected, searchOpen]);

  function openNewCompose() {
    setDraft(emptyDraft());
    setComposeOpen(true);
  }

  function handleReply(item: MailItem) {
    setDraft(replyDraft(item));
    setComposeOpen(true);
  }

  function handleSent(sent: ComposeDraft) {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const item: MailItem = {
      id: `sent-${now.getTime()}`,
      sender: 'You',
      initials: initialsFromUser(session),
      email: sent.to,
      subject: sent.subject,
      preview: sent.body.slice(0, 120) || '(attachment)',
      body: sent.body || '(empty body)',
      date: time,
      avatarColor: 'from-[#51e6c2] to-[#4d8dff]',
    };
    setSentMail((prev) => [item, ...prev]);
  }

  function handleLogout() {
    clearAuthSession();
    setSession(null);
    setSelected(null);
    setComposeOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
  }

  function toggleTheme() {
    setTheme((c) => (c === 'dark' ? 'light' : 'dark'));
  }

  if (!sessionReady) {
    return (
      <div className="grid h-full place-items-center bg-canvas text-sm font-semibold text-ink/50 dark:bg-[#0c1017] dark:text-white/50">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthScreen
        theme={theme}
        onThemeToggle={toggleTheme}
        onAuthenticated={() => setSession(getStoredAuthSession())}
      />
    );
  }

  return (
    <AppShell
      header={
        <AppHeader
          theme={theme}
          searchOpen={searchOpen}
          searchQuery={searchQuery}
          userInitials={initialsFromUser(session)}
          userName={
            (session?.user?.fullname as string | undefined) ||
            (session?.user?.username as string | undefined)
          }
          onThemeToggle={toggleTheme}
          onCompose={openNewCompose}
          onLogout={handleLogout}
          onSearchOpen={setSearchOpen}
          onSearchQuery={setSearchQuery}
        />
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <MailStage
          title="Inbox"
          reading={Boolean(selected)}
          onBack={() => setSelected(null)}
          readerTitle={selected?.subject}
          emptyMessage={searchEmpty ? `No results for “${searchQuery.trim()}”` : undefined}
        >
          {selected ? (
            <MailReader item={selected} onReply={handleReply} />
          ) : searchEmpty ? (
            <p className="px-2 py-12 text-center text-sm font-medium text-ink/45 dark:text-white/45">
              Try another name or subject.
            </p>
          ) : (
            <MailList
              items={visibleMail}
              onSelect={(item) => {
                setSelected(item);
                setSearchOpen(false);
              }}
            />
          )}
        </MailStage>
      </div>

      <ComposeDrawer
        open={composeOpen}
        draft={draft}
        onOpenChange={setComposeOpen}
        onDraftChange={setDraft}
        onSent={handleSent}
      />
    </AppShell>
  );
}

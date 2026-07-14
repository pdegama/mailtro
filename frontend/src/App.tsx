import { useEffect, useMemo, useState } from 'react';
import { Archive, Clock3, FileImage, Inbox, Moon, Pin, SunMedium } from 'lucide-react';
import { AppShell } from './components/mail/AppShell';
import { CommandMenu } from './components/mail/CommandMenu';
import { ComposePanel } from './components/mail/ComposePanel';
import { MailSection } from './components/mail/MailSection';
import { MailStage } from './components/mail/MailStage';
import { ScreenerList } from './components/mail/ScreenerList';
import { UtilityChrome } from './components/mail/UtilityChrome';
import type { AppView, MailItem } from './data/imbox';
import { feedItems, newForYou, paperTrailItems, previouslySeen } from './data/imbox';

type ViewConfig = {
  title: string;
  badge?: string;
  icon: typeof Inbox;
  sections?: Array<{
    title: string;
    action?: string;
    items: MailItem[];
  }>;
};

const quietItems: MailItem[] = [
  {
    id: 'quiet-1',
    sender: 'The Mailtro Team',
    initials: 'MT',
    subject: 'Nothing is waiting here',
    preview: 'When you save something for this place, it will show up in this calm stack.',
    date: 'Now',
    avatarColor: 'from-[#8557ff] to-[#4d8dff]',
    route: 'Empty',
    source: 'system',
  },
];

const viewConfig: Record<AppView, ViewConfig> = {
  imbox: {
    title: 'Focus Mail',
    badge: 'Review sources',
    icon: Inbox,
    sections: [
      { title: 'Needs attention', action: 'Open team view', items: newForYou },
      { title: 'Recently handled', items: previouslySeen },
    ],
  },
  feed: {
    title: 'Automation Feed',
    badge: 'Updates',
    icon: Inbox,
    sections: [{ title: 'Fresh signals', action: 'Mark resolved', items: feedItems }],
  },
  'paper-trail': {
    title: 'Ledger',
    badge: 'Records',
    icon: Archive,
    sections: [{ title: 'Captured automatically', action: 'Export CSV', items: paperTrailItems }],
  },
  'reply-later': {
    title: 'Reply Queue',
    badge: 'Saved replies',
    icon: Clock3,
    sections: [{ title: 'Queued replies', action: 'Start batch', items: quietItems }],
  },
  'set-aside': {
    title: 'Hold Queue',
    badge: 'Pinned',
    icon: Pin,
    sections: [{ title: 'Held for context', action: 'Clear resolved', items: quietItems }],
  },
  files: {
    title: 'Asset Library',
    badge: 'Attachments',
    icon: FileImage,
    sections: [{ title: 'Recent assets', action: 'Browse files', items: paperTrailItems }],
  },
  screener: {
    title: 'Source Review',
    badge: 'Unknown sources',
    icon: Inbox,
  },
};

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [composeOpen, setComposeOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<AppView>('imbox');

  const activeView = useMemo(() => viewConfig[view], [view]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === 'm' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        setMenuOpen((current) => !current);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <AppShell theme={theme}>
      <UtilityChrome
        theme={theme}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((current) => !current)}
        onThemeToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
      />

      <MailStage
        title={activeView.title}
        badge={activeView.badge}
        onCompose={() => setComposeOpen(true)}
        className={theme === 'dark' ? 'min-h-[82vh]' : 'min-h-[76vh]'}
      >
        {view === 'screener' ? (
          <ScreenerList />
        ) : (
          <div className="mx-auto max-w-[870px]">
            {activeView.sections?.map((section) => (
              <MailSection
                key={section.title}
                title={section.title}
                action={section.action}
                items={section.items}
              />
            ))}
          </div>
        )}
      </MailStage>

      <button
        type="button"
        onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        className="fixed bottom-4 right-4 z-20 grid size-11 place-items-center rounded-full border border-ink/8 bg-white/85 text-ink shadow-lg backdrop-blur transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-white"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <SunMedium className="size-5" /> : <Moon className="size-5" />}
      </button>

      <CommandMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(nextView) => {
          setView(nextView);
          setMenuOpen(false);
        }}
      />
      <ComposePanel open={composeOpen} onClose={() => setComposeOpen(false)} />
    </AppShell>
  );
}

import type { ReactNode } from 'react';
import { APP_WIDTH } from '../../lib/layout';

type AppShellProps = {
  children: ReactNode;
  header: ReactNode;
};

/** Centered 569px column — same width as the compose drawer. */
export function AppShell({ children, header }: AppShellProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-canvas text-ink transition-colors duration-300 dark:bg-[#0c1017] dark:text-white">
      <header className="z-30 shrink-0 border-b border-ink/6 bg-canvas/90 backdrop-blur-md dark:border-white/8 dark:bg-[#0c1017]/90">
        <div className="mx-auto w-full px-3" style={{ maxWidth: APP_WIDTH }}>
          {header}
        </div>
      </header>

      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          className="mx-auto flex h-full min-h-0 w-full flex-1 flex-col px-3 pb-3 pt-2"
          style={{ maxWidth: APP_WIDTH }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}

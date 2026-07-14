import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type AppShellProps = {
  children: ReactNode;
  theme: 'light' | 'dark';
};

export function AppShell({ children, theme }: AppShellProps) {
  return (
    <div className={cn(theme === 'dark' && 'dark')}>
      <main className="relative min-h-screen overflow-hidden bg-[#f7f7f4] text-ink transition-colors duration-300 dark:bg-[#111722] dark:text-white">
        <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-3 py-2 sm:px-5">
          {children}
        </div>
      </main>
    </div>
  );
}

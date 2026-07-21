import { useEffect, useState } from 'react';
import { AuthScreen } from './components/auth/AuthScreen';
import { Onboarding } from './components/auth/Onboarding';
import { MailApp } from './components/mail/MailApp';
import {
  clearAuthSession,
  getStoredAuthSession,
  type AuthSession,
} from './api/axiosClient';
import { queryClient } from './api/queryClient';

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (window.localStorage.getItem('mailtro-theme') as 'light' | 'dark') || 'light';
  });
  const [session, setSession] = useState<AuthSession | null>(() => getStoredAuthSession());
  const [onboarding, setOnboarding] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('mailtro-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((c) => (c === 'dark' ? 'light' : 'dark'));
  }

  function handleLogout() {
    clearAuthSession();
    queryClient.clear();
    setSession(null);
    setOnboarding(false);
  }

  if (!session?.token) {
    return (
      <AuthScreen
        theme={theme}
        onThemeToggle={toggleTheme}
        onAuthenticated={({ registered }) => {
          setSession(getStoredAuthSession());
          setOnboarding(registered);
        }}
      />
    );
  }

  if (onboarding) {
    return (
      <Onboarding
        username={session.user?.username ?? ''}
        onDone={() => setOnboarding(false)}
      />
    );
  }

  return (
    <MailApp
      session={session}
      theme={theme}
      onThemeToggle={toggleTheme}
      onLogout={handleLogout}
    />
  );
}

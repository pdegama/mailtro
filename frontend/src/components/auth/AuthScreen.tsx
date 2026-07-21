import { useState, type FormEvent } from 'react';
import { Moon, Sun } from 'lucide-react';
import { axiosClient, setAuthSession, type AuthSession } from '../../api/axiosClient';
import { getErrorMessage } from '../../lib/errors';
import { Button, Field, Input } from '../ui/primitives';
import { BrandMark } from '../BrandMark';

type Mode = 'login' | 'register';

type Props = {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  /** registered=true means this is a brand-new account → run onboarding */
  onAuthenticated: (opts: { registered: boolean }) => void;
};

export function AuthScreen({ theme, onThemeToggle, onAuthenticated }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload =
        mode === 'login'
          ? { username: username.trim(), password }
          : { fullname: fullname.trim(), username: username.trim(), password };
      const { data } = await axiosClient.post<AuthSession>(path, payload);
      setAuthSession(data);
      onAuthenticated({ registered: mode === 'register' });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex h-full flex-col bg-canvas">
      <header className="flex items-center justify-between px-6 py-5">
        <BrandMark />
        <button
          onClick={onThemeToggle}
          className="rounded-md p-2 text-ink-3 hover:bg-line/50 hover:text-ink"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 pt-[12vh]">
        <div className="w-full max-w-[360px]">
          <h1 className="text-center text-[22px] font-semibold tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-1.5 text-center text-[13px] text-ink-2">
            {mode === 'login'
              ? 'Sign in to your Mailtro inbox.'
              : 'Open-source mail on your own domain.'}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-3.5">
            {mode === 'register' && (
              <Field label="Full name">
                <Input
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="Ada Lovelace"
                  autoComplete="name"
                />
              </Field>
            )}
            <Field label="Username">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="ada"
                autoComplete="username"
                autoFocus
                required
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
            </Field>

            {error && (
              <p className="rounded-md border border-bad/25 bg-bad/8 px-3 py-2 text-[12.5px] text-bad">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" className="h-9 w-full" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-[12.5px] text-ink-2">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              className="font-medium text-accent hover:underline"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </main>

      <footer className="pb-6 text-center text-[11.5px] text-ink-3">
        Mailtro — minimal open-source mail
      </footer>
    </div>
  );
}

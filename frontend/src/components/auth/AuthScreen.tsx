import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Moon, SunMedium } from 'lucide-react';
import { axiosClient, setAuthSession } from '../../api/axiosClient';
import { getErrorMessage } from '../../lib/errors';
import { cn } from '../../lib/cn';

type AuthScreenProps = {
  onAuthenticated: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
};

type FieldErrors = {
  fullname?: string;
  username?: string;
  password?: string;
};

export function AuthScreen({ onAuthenticated, theme, onThemeToggle }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => (mode === 'login' ? 'Sign in' : 'Create account'), [mode]);

  function validateClient(): boolean {
    const next: FieldErrors = {};

    if (mode === 'register' && !fullname.trim()) {
      next.fullname = 'Full name is required.';
    }

    const u = username.trim();
    if (!u) {
      next.username = 'Username is required.';
    } else if (u.length < 3) {
      next.username = 'At least 3 characters.';
    } else if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9._-]{0,62}[a-zA-Z0-9])?$/.test(u)) {
      next.username = 'Letters, numbers, dots, _ or - only.';
    }

    if (!password) {
      next.password = 'Password is required.';
    } else if (password.length < 6) {
      next.password = 'At least 6 characters.';
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!validateClient()) return;

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload =
        mode === 'login'
          ? { username: username.trim(), password }
          : { fullname: fullname.trim(), username: username.trim(), password };

      const response = await axiosClient.post(endpoint, payload);
      const token = response.data?.token;
      const user = response.data?.user;

      if (!token || !user) {
        throw new Error('Server did not return a session. Please try again.');
      }

      setAuthSession({ user, token });
      onAuthenticated();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Authentication failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  function switchMode(next: 'login' | 'register') {
    setMode(next);
    setError('');
    setFieldErrors({});
  }

  return (
    <div className="relative flex h-full min-h-0 items-center justify-center overflow-y-auto bg-canvas px-4 py-10 text-ink dark:bg-[#0c1017] dark:text-white">
      <button
        type="button"
        onClick={onThemeToggle}
        className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-ink/8 bg-white/80 text-ink/70 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-white/70 dark:hover:bg-white/12"
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {theme === 'dark' ? <SunMedium className="size-4" /> : <Moon className="size-4" />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="w-full max-w-[400px]"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-ink text-sm font-black uppercase text-white dark:bg-white dark:text-ink">
            mt
          </div>
          <h1 className="m-0 text-2xl font-black tracking-tight">Mailtro</h1>
          <p className="m-0 mt-1.5 text-sm font-medium text-ink/50 dark:text-white/50">
            Focused mail for real work
          </p>
        </div>

        <div className="rounded-[1.35rem] border border-ink/8 bg-white p-6 shadow-[0_24px_70px_-48px_rgba(18,24,38,0.55)] dark:border-white/10 dark:bg-[#141a24] dark:shadow-black/40 sm:p-7">
          <div className="mb-5 grid grid-cols-2 rounded-xl border border-ink/8 bg-ink/[0.03] p-1 dark:border-white/10 dark:bg-white/[0.04]">
            {(['login', 'register'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => switchMode(key)}
                className={cn(
                  'relative min-h-9 rounded-lg text-sm font-bold transition',
                  mode === key ? 'text-ink dark:text-white' : 'text-ink/45 hover:text-ink/70 dark:text-white/45 dark:hover:text-white/70'
                )}
              >
                {mode === key ? (
                  <motion.span
                    layoutId="auth-tab"
                    className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-white/12"
                    transition={{ type: 'spring', damping: 28, stiffness: 360 }}
                  />
                ) : null}
                <span className="relative z-10">{key === 'login' ? 'Sign in' : 'Register'}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 12 : -12 }}
              transition={{ duration: 0.18 }}
              className="space-y-3.5"
              onSubmit={handleSubmit}
              noValidate
            >
              {mode === 'register' ? (
                <Field label="Full name" error={fieldErrors.fullname}>
                  <input
                    className={inputClass(fieldErrors.fullname)}
                    placeholder="Alex Morgan"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    autoComplete="name"
                  />
                </Field>
              ) : null}

              <Field label="Username" error={fieldErrors.username}>
                <input
                  className={inputClass(fieldErrors.username)}
                  placeholder="alex.morgan"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </Field>

              <Field label="Password" error={fieldErrors.password}>
                <input
                  type="password"
                  className={inputClass(fieldErrors.password)}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </Field>

              <AnimatePresence>
                {error ? (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-2 rounded-xl border border-coral/25 bg-coral/10 px-3 py-2.5 text-sm font-medium text-coral">
                      <AlertCircle className="mt-0.5 size-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="mt-1 w-full rounded-xl bg-ink px-4 py-3 text-sm font-bold text-white transition hover:bg-ink/90 disabled:opacity-70 dark:bg-white dark:text-ink dark:hover:bg-white/92"
              >
                {loading ? 'Please wait…' : title}
              </motion.button>
            </motion.form>
          </AnimatePresence>
        </div>

        <p className="mt-5 text-center text-sm text-ink/50 dark:text-white/50">
          {mode === 'login' ? (
            <>
              No account?{' '}
              <button type="button" className="font-bold text-ink underline-offset-2 hover:underline dark:text-white" onClick={() => switchMode('register')}>
                Register
              </button>
            </>
          ) : (
            <>
              Have an account?{' '}
              <button type="button" className="font-bold text-ink underline-offset-2 hover:underline dark:text-white" onClick={() => switchMode('login')}>
                Sign in
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink/45 dark:text-white/45">
        {label}
      </span>
      {children}
      {error ? <p className="mt-1 text-xs font-medium text-coral">{error}</p> : null}
    </label>
  );
}

function inputClass(error?: string) {
  return cn(
    'w-full rounded-xl border bg-ink/[0.025] px-3.5 py-2.5 text-sm outline-none transition focus:bg-white dark:bg-white/[0.04] dark:focus:bg-white/[0.07]',
    error
      ? 'border-coral/50 focus:border-coral'
      : 'border-ink/10 focus:border-ink/25 dark:border-white/10 dark:focus:border-white/25'
  );
}

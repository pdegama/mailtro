import { useMemo, useState } from 'react';
import { LockKeyhole, Mail, UserRound } from 'lucide-react';
import { axiosClient, setAuthSession } from '../../api/axiosClient';

type AuthScreenProps = {
  onAuthenticated: () => void;
};

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => (mode === 'login' ? 'Sign in' : 'Create account'), [mode]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload =
        mode === 'login'
          ? { username, password }
          : { fullname, username, password };

      const response = await axiosClient.post(endpoint, payload);
      const token = response.data?.token;
      const user = response.data?.user;

      if (!token || !user) {
        throw new Error('No auth payload returned by the server');
      }

      setAuthSession({ user, token });
      onAuthenticated();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(133,87,255,0.16),_transparent_45%),linear-gradient(135deg,#f8f7ff_0%,#eef4ff_100%)] px-4 py-12 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/80 shadow-[0_25px_80px_rgba(15,23,42,0.10)] backdrop-blur xl:flex-row">
        <div className="flex flex-1 flex-col justify-between bg-slate-950 p-8 text-white sm:p-10">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-slate-200">
              Mailtro
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Your inbox, secured with a modern sign-in flow.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300 sm:text-base">
              Register or log in to access your mail workspace. The app stores your session locally so you can continue where you left off.
            </p>
          </div>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-300">
            <p className="font-medium text-white">Tip</p>
            <p className="mt-2">Use a username with only letters, numbers, dots, underscores, or hyphens.</p>
          </div>
        </div>

        <div className="flex-1 p-6 sm:p-8 lg:p-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Authentication</p>
              <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-100 p-3 text-slate-700">
              <LockKeyhole className="size-5" />
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <UserRound className="size-4" /> Full name
                </span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
                  placeholder="Alex Morgan"
                  value={fullname}
                  onChange={(event) => setFullname(event.target.value)}
                />
              </label>
            )}

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Mail className="size-4" /> Username
              </span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
                placeholder="alex.morgan"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Please wait…' : title}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button type="button" className="font-semibold text-violet-600" onClick={() => setMode('register')}>
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" className="font-semibold text-violet-600" onClick={() => setMode('login')}>
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

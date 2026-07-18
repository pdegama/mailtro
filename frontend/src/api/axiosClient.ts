import axios from 'axios';

type AuthSession = {
  token: string;
  user: {
    id?: number;
    username?: string;
    fullname?: string;
    [key: string]: unknown;
  };
};

const STORAGE_KEY = 'mailtro-auth';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

function readStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function applyAuthHeader(token?: string) {
  if (token) {
    axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }
  delete axiosClient.defaults.headers.common.Authorization;
}

export function getStoredAuthSession() {
  return readStoredSession();
}

export function setAuthSession(session: AuthSession | null) {
  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
    applyAuthHeader();
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  applyAuthHeader(session.token);
}

export function clearAuthSession() {
  setAuthSession(null);
}

const storedSession = readStoredSession();
if (storedSession?.token) {
  applyAuthHeader(storedSession.token);
}

export type { AuthSession };

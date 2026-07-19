import axios from 'axios';

/** Pull a human-readable message from axios, Error, or unknown failures. */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string; message?: string } | string | undefined;

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    if (data && typeof data === 'object') {
      if (typeof data.error === 'string' && data.error.trim()) {
        return data.error;
      }
      if (typeof data.message === 'string' && data.message.trim()) {
        return data.message;
      }
    }

    if (err.response?.status === 401) {
      return 'Invalid username or password.';
    }
    if (err.response?.status === 404) {
      return 'Service not found. Is the backend running?';
    }
    if (err.code === 'ERR_NETWORK' || !err.response) {
      return 'Cannot reach the server. Check that the API is running.';
    }

    if (err.message) {
      return err.message;
    }
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}

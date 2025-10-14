import { BASE_LOGIN_URL } from './config';
import { unsetAuthUserData } from '../utils/helper';
import { toast } from 'react-toastify';

type Options = RequestInit & { json?: unknown };

// Ensure we only show the session-expired toast / redirect once per invalidation
let authInvalidationHandled = false;

async function http(path: string, opts: Options = {}) {
  const token = (() => {
    try { return window.localStorage.getItem('token'); } catch { return null; }
  })();
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string> | undefined) };

  // Only set Content-Type when caller provided `json` payload.
  if (opts.json !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.token = token;

  const body = opts.json !== undefined ? JSON.stringify(opts.json) : opts.body;

  const res = await fetch(`${BASE_LOGIN_URL}${path}`, {
    ...opts,
    headers,
    body,
  });

  const data = await res.json().catch(() => ({}));

  // Centralized handling for authentication/token issues to avoid many
  // components showing the raw backend error message repeatedly.
  const serverMessage = String((data && ((data as any).message || (data as any).error?.message || (data as any).error?.error)) || '').toLowerCase();
  const looksLikeAuthError = res.status === 401 || /validate token|invalid token|token expired|jwt expired|unauthoriz/i.test(serverMessage);
  if (!res.ok) {
    if (looksLikeAuthError) {
      if (!authInvalidationHandled) {
        authInvalidationHandled = true;
        try { unsetAuthUserData(); } catch { /* ignore */ }
        // Friendly message and redirect to login
        try { toast.error('Session expired. Please login again.'); } catch { /* ignore */ }
        // small timeout so toast can render before navigation
        setTimeout(() => { window.location.href = '/'; }, 600);
      }
      // Throw a normalized error so callers don't surface the backend token message repeatedly
      const err = new Error('AUTH_EXPIRED');
      (err as any).code = 'AUTH_EXPIRED';
      throw err;
    }

    // Non-auth failures: throw parsed data so callers can show messages as before
    throw data;
  }

  return data;
}

export default http;

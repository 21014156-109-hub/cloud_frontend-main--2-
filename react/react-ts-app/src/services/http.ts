import { BASE_LOGIN_URL } from './config';

type Options = RequestInit & { json?: unknown };

async function http(path: string, opts: Options = {}) {
  const token = window.localStorage.getItem('token');
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
  if (!res.ok) throw data;
  return data;
}

export default http;

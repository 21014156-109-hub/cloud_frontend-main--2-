import { BASE_LOGIN_URL } from './config';

type Options = RequestInit & { json?: unknown };

async function http(path: string, opts: Options = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = window.localStorage.getItem('token');
  if (token) headers.token = token;
  const res = await fetch(`${BASE_LOGIN_URL}${path}`, {
    ...opts,
    headers: { ...headers, ...(opts.headers as Record<string, string> | undefined) },
    body: opts.json !== undefined ? JSON.stringify(opts.json) : opts.body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}

export default http;

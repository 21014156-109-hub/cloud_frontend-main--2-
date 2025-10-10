export async function clientLogin(body: any) {
  const url = (import.meta.env.VITE_BASE_LOGIN_URL || 'http://127.0.0.1:3000/v1/') + 'login';
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ message: 'Network error' }));
    throw new Error(err.error || err.message || 'Login failed');
  }
  return await resp.json();
}

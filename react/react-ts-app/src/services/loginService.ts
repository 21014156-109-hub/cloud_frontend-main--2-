export async function clientLogin(body: any) {
  const url = (import.meta.env.VITE_BASE_LOGIN_URL || 'http://127.0.0.1:3000/v1/') + 'login';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Login failed');
  }
  const data = await res.json();
  return data;
}

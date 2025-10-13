import http from './http';

export async function clientLogin(body: unknown) {
  // login uses BASE_LOGIN_URL internally in http
  return http('login', { method: 'POST', json: body });
}

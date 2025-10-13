import http from '../../services/http';

export async function clientLogin(body: unknown) {
  return http('login', { method: 'POST', json: body });
}

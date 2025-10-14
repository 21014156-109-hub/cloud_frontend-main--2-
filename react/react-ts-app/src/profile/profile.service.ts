import http from '../services/http';

export class ProfileService {
  async getRecord(id: number) {
    return http(`user/info/${id}`);
  }

  async update(body: Record<string, unknown>) {
    return http('user/update', { method: 'PATCH', json: body });
  }
}

export default new ProfileService();

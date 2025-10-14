import http from '../services/http';

export class ProfileService {
  async getRecord(id: number) {
    return http(`user/info/${id}`);
  }

  async update(body: any) {
    return http('user/update', { method: 'PATCH', json: body });
  }
}

export default new ProfileService();

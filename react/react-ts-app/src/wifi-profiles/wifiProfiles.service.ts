import http from '../services/http';

export class WifiProfilesService {
  async getWifiProfilesList(page = 0, size = 10) {
    return http(`user/getAllWifiProfiles?page=${page}&size=${size}`);
  }

  async deleteWifiProfile(id: number) {
    return http(`user/deleteWifiProfile/${id}`, { method: 'DELETE' });
  }

  async insert(body: { warehouseId: number | string; networkName: string; password: string }) {
    return http('user/addWifiProfile', { method: 'POST', json: body });
  }

  async update(body: { id: number; warehouseId: number | string; networkName: string; password: string }) {
    return http('user/updateWifiProfile', { method: 'PATCH', json: body });
  }

  async getwifiProfile(id: number) {
    return http(`user/getwifiProfile/${id}`);
  }

  async checkWifiProfileAssigned(id: number) {
    return http(`user/checkWifiProfileAssigned/${id}`);
  }

  async getWarehouseInfo() {
    return http('warehouse');
  }

  async getClientsInfo() {
    return http('users');
  }
}

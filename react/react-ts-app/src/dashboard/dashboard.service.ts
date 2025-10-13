import http from '../services/http';

export class DashboardService {
  async getCount() {
    return http('dashboard/statsCount');
  }

  async getDevicesBytype() {
    return http('dashboard/devicesCountByType');
  }

  async getDevicesCountByDate(searchType: string) {
    return http(`dashboard/getDevicesCountByDate?searchType=${searchType}`);
  }

  async getDevicesCountOfTopUsers() {
    return http('dashboard/getDevicesCountOfTopUsers');
  }

  async getEsnServices() {
    return http('dashboard/getEsnServices');
  }
}


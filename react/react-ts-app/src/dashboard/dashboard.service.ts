export class DashboardService {
  private base = (import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:3000/v1/') as string;

  private async get(path: string) {
    const token = window.localStorage.getItem('token') || '';
    const url = `${this.base}${path}`;
    const resp = await fetch(url, { headers: { token } });
    return await resp.json();
  }

  async getCount() {
    return this.get('dashboard/statsCount');
  }

  async getDevicesBytype() {
    return this.get('dashboard/devicesCountByType');
  }

  async getDevicesCountByDate(searchType: string) {
    return this.get(`dashboard/getDevicesCountByDate?searchType=${searchType}`);
  }

  async getDevicesCountOfTopUsers() {
    return this.get('dashboard/getDevicesCountOfTopUsers');
  }

  async getEsnServices() {
    return this.get('dashboard/getEsnServices');
  }
}

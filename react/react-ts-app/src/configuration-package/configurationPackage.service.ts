export interface ApiResponse<T = unknown> { status: boolean; data: T; message?: string }

export class ConfigurationPackageService {
  private base = (import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:3000/v1/') as string;
  private tokenHeader() { return { token: window.localStorage.getItem('token') || '' } as Record<string, string>; }

  private async get(path: string) {
    const res = await fetch(`${this.base}${path}`, { headers: this.tokenHeader() });
    return res.json();
  }
  private async post(path: string, body: unknown) {
    const res = await fetch(`${this.base}${path}`, { method: 'POST', headers: { ...this.tokenHeader(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return res.json();
  }

  getClientGrades(): Promise<ApiResponse<{ grades: string[] }>> {
    return this.get('user/getDeviceGrades');
  }

  updateClientGrades(grades: string[]): Promise<ApiResponse<{ grades: string[] }>> {
    return this.post('user/updateDeviceGrades', { grades });
  }
}

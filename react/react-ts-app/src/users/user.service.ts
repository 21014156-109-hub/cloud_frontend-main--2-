export interface ApiListResponse<T> { status: boolean; data: T };
export interface ClientUser { id: number; fName?: string; lName?: string; userName?: string };

export class UserService {
  private base = (import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:3000/v1/') as string;

  private tokenHeader() {
    return { token: window.localStorage.getItem('token') || '' } as Record<string, string>;
  }

  private async get(path: string) {
    const resp = await fetch(`${this.base}${path}`, { headers: this.tokenHeader() });
    return resp.json();
  }

  getRecords(clientId: number, role: string = '', status: string = '', search: string = ''): Promise<ApiListResponse<ClientUser[]>> {
    const q = new URLSearchParams();
    q.set('clientId', String(clientId));
    if (role) q.set('role', role);
    if (status) q.set('status', status);
    if (search) q.set('search', search);
    return this.get(`user/listing?${q.toString()}`);
  }

  downloadBuildFile(fileName?: string): Promise<ApiListResponse<unknown>> {
    return this.get(`build/download-file?fileName=${fileName ?? ''}`);
  }

  getMacBuildNo(): Promise<ApiListResponse<unknown>> {
    return this.get('build/no');
  }
}

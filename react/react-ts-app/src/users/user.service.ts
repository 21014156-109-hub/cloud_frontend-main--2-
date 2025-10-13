import http from '../services/http';

export interface ApiListResponse<T> { status: boolean; data: T };
export interface ClientUser { id: number; fName?: string; lName?: string; userName?: string };

export class UserService {
  private http = http;

  getRecords(clientId: number, role: string = '', status: string = '', search: string = ''): Promise<ApiListResponse<ClientUser[]>> {
    const q = new URLSearchParams();
    q.set('clientId', String(clientId));
    if (role) q.set('role', role);
    if (status) q.set('status', status);
    if (search) q.set('search', search);
    return this.http(`user/listing?${q.toString()}`);
  }

  downloadBuildFile(fileName?: string): Promise<ApiListResponse<unknown>> {
    return this.http(`build/download-file?fileName=${fileName ?? ''}`);
  }

  getMacBuildNo(): Promise<ApiListResponse<unknown>> {
    return this.http('build/no');
  }
}

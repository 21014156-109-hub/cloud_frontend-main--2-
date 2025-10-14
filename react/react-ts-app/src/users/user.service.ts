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

  insert(body: unknown) {
    return this.http('user/add', { method: 'POST', json: body });
  }

  update(body: unknown) {
    return this.http('user/update', { method: 'PATCH', json: body });
  }

  delete(apiID: string) {
    return this.http(`user/delete/${apiID}`, { method: 'DELETE' });
  }

  getUsersListing(clientId: number, page: number, size: number) {
    return this.http(`user/getUserListing?clientId=${clientId}&page=${page}&size=${size}`);
  }

  getRecord(id: string) {
    return this.http(`user/info/${id}`);
  }

  getUserRoles(type: string) {
    return this.http(`role/listing?type=${encodeURIComponent(type)}`);
  }

  downloadBuildFile(fileName?: string): Promise<ApiListResponse<unknown>> {
    return this.http(`build/download-file?fileName=${fileName ?? ''}`);
  }

  getMacBuildNo(): Promise<ApiListResponse<unknown>> {
    return this.http('build/no');
  }
}

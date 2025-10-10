export interface ApiPage<T> { totalItems: number; totalPages: number; data: T[] }
export interface ApiResponse<T = unknown> { status: boolean; data: T; message?: string }

export class CloudDBService {
  private base = (import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:3000/v1/') as string;
  private tokenHeader() { return { token: window.localStorage.getItem('token') || '' } as Record<string, string>; }

  private async get(path: string) {
    const res = await fetch(`${this.base}${path}`, { headers: this.tokenHeader() });
    return res.json();
  }
  private async postBlob(path: string, body: unknown) {
    const res = await fetch(`${this.base}${path}`, { method: 'POST', headers: { ...this.tokenHeader(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error('Export failed');
    return res.blob();
  }

  getCollectionInfo(clientId: number, page: number, size: number, searchText: string, searchType: string): Promise<ApiResponse<ApiPage<Record<string, unknown>>>> {
    return this.get(`user/getCloudDbDevices?clientId=${clientId}&page=${page}&size=${size}&searchText=${encodeURIComponent(searchText)}&searchType=${encodeURIComponent(searchType)}`);
  }

  getDeviceAnalysisRecords(clientId: number, page: number, size: number): Promise<ApiResponse<ApiPage<Record<string, unknown>>>> {
    return this.get(`user/getDeviceAnalyses?clientId=${clientId}&page=${page}&size=${size}`);
  }

  getDevicesRecords(id: number): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.get(`user/getDevicesRecords/${id}`);
  }

  exportReport(body: { clientId: number | string; type: string; searchText: string; searchType: string; columns: { name: string; prop: string; checked?: boolean }[] }): Promise<Blob> {
    return this.postBlob('user/exportCloudDbDevices', body);
  }

  getDeviceByTransactionId(id: number): Promise<ApiResponse<unknown>> {
    return this.get(`user/getDeviceByTransactionId?id=${id}`);
  }
}

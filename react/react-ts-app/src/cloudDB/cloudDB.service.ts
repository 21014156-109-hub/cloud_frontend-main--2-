export interface ApiPage<T> { totalItems: number; totalPages: number; data: T[] }
export interface ApiResponse<T = unknown> { status: boolean; data: T; message?: string }

import http from '../services/http';
import { BASE_LOGIN_URL } from '../services/config';

export class CloudDBService {
  private http = http;

  getCollectionInfo(clientId: number, page: number, size: number, searchText: string, searchType: string): Promise<ApiResponse<ApiPage<Record<string, unknown>>>> {
    return this.http(`user/getCloudDbDevices?clientId=${clientId}&page=${page}&size=${size}&searchText=${encodeURIComponent(searchText)}&searchType=${encodeURIComponent(searchType)}`);
  }

  getDeviceAnalysisRecords(clientId: number, page: number, size: number): Promise<ApiResponse<ApiPage<Record<string, unknown>>>> {
    return this.http(`user/getDeviceAnalyses?clientId=${clientId}&page=${page}&size=${size}`);
  }

  getDevicesRecords(id: number): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.http(`user/getDevicesRecords/${id}`);
  }

  async exportReport(body: { clientId: number | string; type: string; searchText: string; searchType: string; columns: { name: string; prop: string; checked?: boolean }[] }): Promise<Blob> {
    // export may produce a blob; use fetch directly with BASE_LOGIN_URL and token header
    const token = window.localStorage.getItem('token') || '';
    const res = await fetch(`${BASE_LOGIN_URL}user/exportCloudDbDevices`, { method: 'POST', headers: { token, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error('Export failed');
    return res.blob();
  }

  getDeviceByTransactionId(id: number): Promise<ApiResponse<unknown>> {
    return this.http(`user/getDeviceByTransactionId?id=${id}`);
  }
}

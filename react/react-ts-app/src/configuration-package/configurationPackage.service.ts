import http from '../services/http';

export interface ApiResponse<T = unknown> { status: boolean; data: T; message?: string }

export class ConfigurationPackageService {
  async getClientGrades(): Promise<ApiResponse<{ grades: string[] }>> {
    return http('user/getDeviceGrades', { method: 'GET' });
  }

  async updateClientGrades(grades: string[]): Promise<ApiResponse<{ grades: string[] }>> {
    return http('user/updateDeviceGrades', { method: 'POST', json: { grades } });
  }
}

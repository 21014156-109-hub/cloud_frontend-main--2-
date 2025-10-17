export interface TestSuiteSummary {
  id: number;
  testSuitName?: string;
  name?: string;
  displayName?: string;
  description?: string;
  testPlan?: unknown[];
  tests?: unknown[];
  createdAt?: string;
}
export interface ApiResponse<T = unknown> { status: boolean; data: T; message?: string }
export interface PaginatedResponse<T> { totalItems: number; totalPages: number; data: T }

import http from '../services/http';

export class TestSuitesService {
  async getAllTestSuites(): Promise<ApiResponse<TestSuiteSummary[]>> {
    return http('test-suits/all');
  }

  async getTestSuites(page: number, size: number): Promise<ApiResponse<PaginatedResponse<TestSuiteSummary[]>>> {
    return http(`test-suits/listing?page=${page}&size=${size}`);
  }

  async deleteTestSuite(id: number): Promise<ApiResponse<unknown>> {
    return http(`test-suits/${id}`, { method: 'DELETE' });
  }

  async createTestSuite(body: { testSuitName: string; description?: string; testPlan: { key: string; value: string }[]; active?: boolean }) {
    return http('test-suits', { method: 'POST', json: body });
  }
}

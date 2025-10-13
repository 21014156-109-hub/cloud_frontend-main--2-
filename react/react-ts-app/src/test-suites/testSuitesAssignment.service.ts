import http from '../services/http';

export interface ApiResponse<T = unknown> { status: boolean; data: T; message?: string }

export class TestSuitesAssignmentService {
  async getTestSuiteAssignmentListing(page: number, size: number): Promise<ApiResponse<Record<string, unknown>>> {
    return http(`test-suits-assignments/listing?page=${page}&size=${size}`);
  }

  async deleteAssignment(id: number): Promise<ApiResponse<Record<string, unknown>>> {
    return http(`test-suits-assignments/${id}`, { method: 'DELETE' });
  }

  async assignTestSuites(data: { testerId: number; clientTestSuitId: number }): Promise<ApiResponse<Record<string, unknown>>> {
    return http('test-suits-assignments/assign', { method: 'POST', json: data });
  }
}

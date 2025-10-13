export interface ApiResponse<T = unknown> { status: boolean; data: T; message?: string }

export class TestSuitesAssignmentService {
  private base = (import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:3000/v1/') as string;
  private headers() { return { token: window.localStorage.getItem('token') || '' } }

  async getTestSuiteAssignmentListing(page: number, size: number): Promise<ApiResponse<Record<string, unknown>>> {
    const res = await fetch(`${this.base}test-suits-assignments/listing?page=${page}&size=${size}`, { headers: this.headers() });
    return res.json();
  }

  async deleteAssignment(id: number): Promise<ApiResponse<Record<string, unknown>>> {
    const res = await fetch(`${this.base}test-suits-assignments/${id}`, { method: 'DELETE', headers: this.headers() });
    return res.json();
  }
}

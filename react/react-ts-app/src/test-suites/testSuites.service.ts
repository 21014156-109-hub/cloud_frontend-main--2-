export interface TestSuiteSummary { id: number; testSuitName?: string; name?: string; displayName?: string }
export interface ApiResponse<T = unknown> { status: boolean; data: T }

export class TestSuitesService {
  private base = (import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:3000/v1/') as string;
  private headers() { return { token: window.localStorage.getItem('token') || '' } }

  async getAllTestSuites(): Promise<ApiResponse<TestSuiteSummary[]>> {
    const resp = await fetch(`${this.base}test-suits/all`, { headers: this.headers() });
    return resp.json();
  }

  async getTestSuites(page: number, size: number): Promise<ApiResponse<TestSuiteSummary[]>> {
    const resp = await fetch(`${this.base}test-suits/listing?page=${page}&size=${size}`, { headers: this.headers() });
    return resp.json();
  }
}

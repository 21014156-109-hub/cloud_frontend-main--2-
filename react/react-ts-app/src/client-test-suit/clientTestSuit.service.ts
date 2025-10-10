export interface ApiResponse<T = unknown> { status: boolean; data: T; message?: string };
export interface ClientTestSuitItem {
  id: number;
  client?: { userName?: string };
  testSuit?: { testSuitName?: string };
  active?: boolean;
}
export interface TestPlanEntry { key: string; value: string }
export interface TestSelection { key: string }
export interface ClientTestSuitPage {
  totalItems: number;
  totalPages: number;
  data: ClientTestSuitItem[];
}

export class ClientTestSuitService {
  private base = (import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:3000/v1/') as string;

  private tokenHeader() {
    return { token: window.localStorage.getItem('token') || '' } as Record<string, string>;
  }

  private async get(path: string) {
    const resp = await fetch(`${this.base}${path}`, { headers: this.tokenHeader() });
    return resp.json();
  }

  private async post(path: string, body: unknown) {
    const headers = { ...this.tokenHeader(), 'Content-Type': 'application/json' };
    const resp = await fetch(`${this.base}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw data;
    return data;
  }

  private async put(path: string, body: unknown) {
    const headers = { ...this.tokenHeader(), 'Content-Type': 'application/json' };
    const resp = await fetch(`${this.base}${path}`, { method: 'PUT', headers, body: JSON.stringify(body) });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw data;
    return data;
  }

  private async del(path: string) {
    const resp = await fetch(`${this.base}${path}`, { method: 'DELETE', headers: this.tokenHeader() });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw data;
    return data;
  }

  getClientTestSuitListing(page: number, size: number): Promise<ApiResponse<ClientTestSuitPage>> {
    return this.get(`client-test-suit/listing?page=${page}&size=${size}`);
  }

  createClientTestSuit(data: { testSuitId: number; active: boolean; clientId?: number }): Promise<ApiResponse> {
    return this.post('client-test-suit', data);
  }

  updateClientTestSuit(clientTestSuitId: number, data: unknown): Promise<ApiResponse> {
    return this.put(`client-test-suit/${clientTestSuitId}`, data);
  }

  deleteClientTestSuit(clientTestSuitId: number): Promise<ApiResponse> {
    return this.del(`client-test-suit/${clientTestSuitId}`);
  }

  getClientTestSuit(clientTestSuitId: number): Promise<ApiResponse<ClientTestSuitItem & { clientId?: number; testSuitId?: number; testSuitName?: string; testSuit?: { testPlan?: TestPlanEntry[] | string } ; testOptionsByAdmin?: TestSelection[] | string; testOptionsByClient?: TestSelection[] | string }>> {
    return this.get(`client-test-suit/${clientTestSuitId}`);
  }

  updateClientTestSuitForClient(clientTestSuitId: number, data: unknown): Promise<ApiResponse> {
    return this.put(`client-test-suit/${clientTestSuitId}/for-client`, data);
  }
}

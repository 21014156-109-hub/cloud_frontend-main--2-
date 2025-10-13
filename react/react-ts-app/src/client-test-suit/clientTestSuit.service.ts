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

import http from '../services/http';

export class ClientTestSuitService {
  private http = http;

  getClientTestSuitListing(page: number, size: number): Promise<ApiResponse<ClientTestSuitPage>> {
    return this.http(`client-test-suit/listing?page=${page}&size=${size}`);
  }

  createClientTestSuit(data: { testSuitId: number; active: boolean; clientId?: number }): Promise<ApiResponse> {
    return this.http('client-test-suit', { method: 'POST', json: data });
  }

  updateClientTestSuit(clientTestSuitId: number, data: unknown): Promise<ApiResponse> {
    return this.http(`client-test-suit/${clientTestSuitId}`, { method: 'PUT', json: data });
  }

  deleteClientTestSuit(clientTestSuitId: number): Promise<ApiResponse> {
    return this.http(`client-test-suit/${clientTestSuitId}`, { method: 'DELETE' });
  }

  getClientTestSuit(clientTestSuitId: number): Promise<ApiResponse<ClientTestSuitItem & { clientId?: number; testSuitId?: number; testSuitName?: string; testSuit?: { testPlan?: TestPlanEntry[] | string } ; testOptionsByAdmin?: TestSelection[] | string; testOptionsByClient?: TestSelection[] | string }>> {
    return this.http(`client-test-suit/${clientTestSuitId}`);
  }

  updateClientTestSuitForClient(clientTestSuitId: number, data: unknown): Promise<ApiResponse> {
    return this.http(`client-test-suit/${clientTestSuitId}/for-client`, { method: 'PUT', json: data });
  }
}

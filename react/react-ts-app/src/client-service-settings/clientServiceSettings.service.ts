export interface BaseResponse<T = unknown> { status: boolean; data: T };
export interface ListingResponse<T = unknown> { status: boolean; data: T };

export class ClientServiceSettingsService {
  private base = (import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:3000/v1/') as string;

  private tokenHeader() {
    return { token: window.localStorage.getItem('token') || '' } as Record<string, string>;
  }

  private async get(path: string) {
    const resp = await fetch(`${this.base}${path}`, { headers: this.tokenHeader() });
    return resp.json();
  }

  private async postJSON(path: string, body: unknown) {
    const headers = { ...this.tokenHeader(), 'Content-Type': 'application/json' };
    const resp = await fetch(`${this.base}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw data;
    return data;
  }

  saveClientService(body: { clientId: number; services: number[] }): Promise<BaseResponse> {
    return this.postJSON('carrier/saveClientService', body);
  }

  getClientServices(clientId: number): Promise<ListingResponse> {
    return this.get(`carrier/clientServices/${clientId}`);
  }
}

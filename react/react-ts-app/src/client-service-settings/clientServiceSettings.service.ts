export interface BaseResponse<T = unknown> { status: boolean; data: T };
export interface ListingResponse<T = unknown> { status: boolean; data: T };

import http from '../services/http';

export class ClientServiceSettingsService {
  saveClientService(body: { clientId: number; services: number[] }): Promise<BaseResponse> {
    return http('carrier/saveClientService', { method: 'POST', json: body });
  }

  getClientServices(clientId: number): Promise<ListingResponse> {
    return http(`carrier/clientServices/${clientId}`);
  }
}

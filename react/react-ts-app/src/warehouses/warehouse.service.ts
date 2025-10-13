import http from '../services/http';

export class WarehouseService {
  getWarehouseInfo() { return http('warehouse'); }
  getClientsInfo() { return http('users'); }
  getTimezoneList() { return http('warehouse/getTimezone'); }
  saveWarehouse(body: unknown) { return http('warehouse/addWarehouse', { method: 'POST', json: body }); }
  updateWarehouse(body: unknown) { return http('warehouse/updateWarehouse', { method: 'PATCH', json: body }); }
  deleteWarehouse(id: string) { return http(`warehouse/deleteWarehouse/${id}`, { method: 'DELETE' }); }
  getCollectionInfoById(clientId: number | string, status = '') { return http(`warehouse/warehouseList?clientId=${clientId}${status ? `&status=${status}` : ''}`); }
  getListing(clientId: number, page:number, size:number) { return http(`warehouse/listing?clientId=${clientId}&page=${page}&size=${size}`); }
  getWarehouseInfoById(id: string) { return http(`warehouse/getWarehouse/${id}`); }
}

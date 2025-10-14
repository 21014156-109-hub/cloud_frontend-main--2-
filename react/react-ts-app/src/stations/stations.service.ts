import http from '../services/http';

export class StationsService {
  getCollectionInfo() {
    return http('station');
  }

  getCollectionInfoById(clientId: string | number, page: number, size: number) {
    return http(`station/stationsList/${clientId}?page=${page}&size=${size}`);
  }

  getStationInfoById(id: string | number) {
    return http(`station/getStation/${id}`);
  }

  saveStation(body: unknown) {
    return http('station/addStation', { method: 'POST', json: body });
  }

  updateStation(body: unknown) {
    return http('station/updateStation', { method: 'PATCH', json: body });
  }

  deleteStation(apiID: string | number) {
    return http(`station/deleteStation/${apiID}`, { method: 'DELETE' });
  }

  getwifiprofilesbyWarehouse(id: number) {
    return http(`station/getwifiProfiles/${id}`);
  }

  saveStationWifiProfile(body: unknown) {
    return http('station/saveStationWifiProfiles', { method: 'POST', json: body });
  }

  getWifiProfileAllocations(stationId: number) {
    return http(`station/getAssignedWifiProfiles/${stationId}`);
  }

  // Stations Assignment
  getStationsAssignmentListing(page: number, size: number) {
    return http(`stationsAssignment/listing?page=${page}&size=${size}`);
  }
  getStationsByClientWarehouse(body: unknown) {
    return http('station/getStationsByWarehouse', { method: 'POST', json: body });
  }
  assignStations(body: unknown) {
    return http('stationsAssignment/assign', { method: 'POST', json: body });
  }
  deleteAllocation(testerId: number) {
    return http(`stationsAssignment/delete/${testerId}`, { method: 'DELETE' });
  }
  getAllocationData(testerId: number) {
    return http(`stationsAssignment/find/${testerId}`);
  }
}

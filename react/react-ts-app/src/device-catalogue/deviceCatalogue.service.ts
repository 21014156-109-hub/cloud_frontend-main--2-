import http from '../services/http';

export class DeviceCatalogueService {
  private http = http;
  private selectedIdsArr: Array<{ id: number; os?: string }> = [];

  listing(page: number, size: number, searchText = '', searchType = 'modelName') {
    return this.http(`deviceCatalogue/listing?page=${page}&size=${size}&searchText=${encodeURIComponent(searchText)}&searchType=${encodeURIComponent(searchType)}`);
  }

  insert(body: any, endpoint = 'add') {
    // form-data or JSON is supported depending on caller
    return this.http(`deviceCatalogue/${endpoint}`, { method: 'POST', body });
  }

  update(body: any) {
    return this.http('deviceCatalogue/update', { method: 'PATCH', body });
  }

  delete(id: any) {
    return this.http(`deviceCatalogue/delete/${id}`, { method: 'DELETE' });
  }

  info(id: any) {
    return this.http(`deviceCatalogue/info/${id}`);
  }

  exportReport(postData: any) {
    return this.http('deviceCatalogue/export', { method: 'POST', body: postData });
  }

  setSelectedIdsArr(arr: Array<{ id: number; os?: string }>) {
    this.selectedIdsArr = arr || [];
  }

  getSelectedIdsArr() {
    return this.selectedIdsArr;
  }
}

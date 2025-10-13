import http from '../services/http';

export class BuildManagementService {
  async listing(page: number, size: number) {
    return http(`build/listing?page=${page}&size=${size}`);
  }

  async uploadBuild(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    // Pass FormData directly to http (it won't set Content-Type for body)
    return http('build/upload-admin', { method: 'POST', body: formData });
  }

  async deleteBuild(buildId: number) {
    return http(`build/delete/${buildId}`, { method: 'DELETE' });
  }
}


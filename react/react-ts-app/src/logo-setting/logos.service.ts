import http from '../services/http';

export class LogosService {
  async uploadLogotoBucket(formData: FormData) {
    // FormData must be passed as body without JSON
    return http('clientSettings/uploadClientLogo', { method: 'POST', body: formData });
  }

  async getClientLogo(id: number) {
    return http(`clientSettings/getClientLogo/${id}`);
  }
}

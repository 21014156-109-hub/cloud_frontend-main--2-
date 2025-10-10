export class BuildManagementService {
  private base = (import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:3000/v1/') as string;

  private async get(path: string) {
    const token = window.localStorage.getItem('token') || '';
    const url = `${this.base}${path}`;
    const resp = await fetch(url, { headers: { token } });
    return await resp.json();
  }

  private async post(path: string, body: BodyInit, extraHeaders: Record<string, string> = {}) {
    const token = window.localStorage.getItem('token') || '';
    const url = `${this.base}${path}`;
    const headers: Record<string, string> = { token, ...extraHeaders };
    const resp = await fetch(url, { method: 'POST', headers, body });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw data;
    return data;
  }

  private async del(path: string) {
    const token = window.localStorage.getItem('token') || '';
    const url = `${this.base}${path}`;
    const resp = await fetch(url, { method: 'DELETE', headers: { token } });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw data;
    return data;
  }

  async listing(page: number, size: number) {
    return this.get(`build/listing?page=${page}&size=${size}`);
  }

  async uploadBuild(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.post('build/upload-admin', formData);
  }

  async deleteBuild(buildId: number) {
    return this.del(`build/delete/${buildId}`);
  }
}

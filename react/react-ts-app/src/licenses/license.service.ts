import http from '../services/http';

const base = 'license';

type JsonBody = Record<string, unknown>;

const LicenseService = {
  getUsers: (role: string, status: string, search = '') => {
    let query = `?role=${role}&status=${status}`;
    if (search) query += `&search=${encodeURIComponent(search)}`;
    return http(`${base}/user/listing${query}`);
  },

  getLicenseInfo: (clientId: string) => http(`${base}/listing/${clientId}`),

  insert: (body: JsonBody) => http(`${base}/add`, { method: 'POST', json: body }),

  getLicenseRequests: (page = 0, size = 20, clientId = '', status = '') => {
    let query = `?page=${page}&size=${size}`;
    if (clientId) query += `&clientId=${clientId}`;
    if (status) query += `&status=${status}`;
    return http(`${base}/requests/${query}`);
  },

  getLicenseRequest: (id: string | number) => http(`${base}/get-request/${id}`),

  getLicenseTypes: () => http(`${base}/types`),

  insertRequest: (body: JsonBody) => http(`${base}/add-request`, { method: 'POST', json: body }),

  updateRequest: (body: JsonBody) => http(`${base}/update-request`, { method: 'PATCH', json: body })
};

export default LicenseService;

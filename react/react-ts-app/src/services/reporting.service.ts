import http from './http';

type ClientLike = string | number | { id: string | number } | undefined | null;

export class ReportingService {
  async getUsers(role: string, status: string, search = '') {
    let url = `user/listing?role=${role}&status=${status}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return http(url, { method: 'GET' });
  }

  async getMonthlyReport(clientId: ClientLike, dateArray: { start: string; end: string }) {
    let cid: string | number | '' = '';
    if (clientId === undefined || clientId === null) cid = '';
    else if (typeof clientId === 'object') cid = (clientId as { id: string | number }).id;
    else cid = clientId as string | number;

    const url = `reporting/monthlyUserActivity?clientId=${cid}&start=${dateArray.start}&end=${dateArray.end}`;
    return http(url, { method: 'GET' });
  }
}

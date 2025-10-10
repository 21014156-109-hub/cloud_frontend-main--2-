import { useEffect, useMemo, useState } from 'react';
import { CloudDBService } from '../cloudDB.service';
import { UserService } from '../../users/user.service';
import { getAuthUserData } from '../../utils/helper';
import PaginationLinks from '../../shared-components/PaginationLinks';

interface AnalysisRow {
  id?: number;
  date?: string;
  record?: number;
  deviceResultsAnalyAsis?: { name?: string } | null;
  user?: { fName?: string; lName?: string } | null;
}

export default function DeviceResultAnalysis() {
  const clouddb = useMemo(() => new CloudDBService(), []);
  const users = useMemo(() => new UserService(), []);
  const user = getAuthUserData();
  const isAdmin = user?.roleSlug === 'admin';

  const [clientId, setClientId] = useState<number>(isAdmin ? 0 : Number(user?.id || user?.clientId || 0));
  const [clients, setClients] = useState<Array<{ id: number; fName?: string; lName?: string; userName?: string }>>([]);
  const [records, setRecords] = useState<AnalysisRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      void users.getRecords(0, 'client').then((res) => { if (res.status) setClients(res.data); });
    }
    void fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const w = window as Window & { __BREADCRUMB?: { name: string; link?: string }[] };
    w.__BREADCRUMB = [{ name: 'Dashboard', link: '/dashboard' }, { name: 'Device Record Analysis', link: '' }];
    return () => { w.__BREADCRUMB = []; };
  }, []);

  async function fetchData(page: number) {
    setCurrentPage(page);
    const resp = await clouddb.getDeviceAnalysisRecords(clientId, page - 1, pageSize);
    if (resp.status) {
      const p = resp.data as { totalItems: number; totalPages: number; data: AnalysisRow[] };
      setTotalRecords(p.totalItems || 0);
      setTotalPages(p.totalPages || 0);
  setRecords(p.data || []);
    }
  }

  return (
    <div className="container-fluid pt-8">
      <div className="row">
        <div className="col">
          <div className="card shadow">
            <div className="row cust-row">
              {isAdmin && (
                <div className="col-md-3">
                  <select id="clientId" className="form-control" value={clientId} onChange={(e) => setClientId(Number(e.target.value))}>
                    <option value={0}>All Clients</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{`${c.fName ?? ''} ${c.lName ?? ''} (${c.userName ?? ''})`}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="col-md-2 form-inline">
                <button type="button" onClick={() => fetchData(1)} className="btn btn-padding btn-dark-custom mb-2 mt-2">Search</button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Sr No.</th>
                    <th>Analysis</th>
                    <th>Date</th>
                    {isAdmin && <th>Client Name</th>}
                    <th>Counts</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td>{((currentPage - 1) * pageSize) + rowIndex + 1}</td>
                      <td>{row.deviceResultsAnalyAsis?.name || 'N/A'}</td>
                      <td>{row.date || '-'}</td>
                      {isAdmin && (
                        <td>{`${row.user?.fName ?? ''} ${row.user?.lName ?? ''}`.trim() || 'N/A'}</td>
                      )}
                      <td>
                        <a href={`/devices/listing?id=${row.id ?? ''}`} target="_blank" rel="noreferrer">
                          <span className="badge bg-primary text-white">{row.record ?? 0}</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {records.length > 0 && (
              <PaginationLinks
                totalRecords={totalRecords}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={(p) => fetchData(p)}
                onPageSizeChange={(s) => { setPageSize(s); fetchData(1); }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserService } from '../../users/user.service';
import { getClientID } from '../../utils/helper';

const userSvc = new UserService();

export default function TestersListing() {
  const clientId = getClientID();
  type TesterRow = {
    id?: string | number;
    srno?: number;
    fName?: string;
    lName?: string;
    userName?: string;
    email?: string;
    role?: { title?: string };
    status?: string | number;
  };
  const [records, setRecords] = useState<TesterRow[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchData = useCallback(async (p: number, s: string = '') => {
    setPage(p);
    const res = await userSvc.getTesterListing(clientId, p - 1, pageSize, s);
    if (res.status) {
      const data = res.data as { totalItems?: number; totalPages?: number; data?: TesterRow[] } | undefined;
      setTotalRecords(data?.totalItems || 0);
      setTotalPages(data?.totalPages || 0);
      setRecords(data?.data || []);
    }
  }, [clientId, pageSize]);

  useEffect(() => { void fetchData(1, search); }, [fetchData, search]);

  function confirmDelete(id: string) {
    if (window.confirm('Are you sure you want to delete this tester?')) {
      void deleteTester(id);
    }
  }

  async function deleteTester(id: string) {
    const rec = await userSvc.delete(id);
    if (rec.status) {
      toast.success((rec as { message?: string }).message || 'Deleted');
      void fetchData(1, search);
    }
  }

  const columns = useMemo(() => ([
    { key: 'srno', label: 'SrNo' },
    { key: 'fName', label: 'First Name' },
    { key: 'lName', label: 'Last Name' },
    { key: 'userName', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'role.title', label: 'Role' },
    { key: 'status', label: 'Status' },
  ]), []);

  function getValue(row: TesterRow, key: string): string {
    if (key === 'role.title') return String(row.role?.title ?? '');
    const k = key as keyof TesterRow;
    const v = row[k];
    return v == null ? '' : String(v);
  }

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between mb-3">
            <h3>Testers Management</h3>
            <div>
              <input className="form-control d-inline-block me-2" style={{ width: 240 }} placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
              <button className="btn btn-secondary me-2" onClick={() => void fetchData(1, search)}>Search</button>
              <button className="btn btn-primary" onClick={() => navigate('/testers/add')}>Add Tester</button>
            </div>
          </div>
          <table className="table table-striped">
            <thead>
              <tr>
                {columns.map(c => (<th key={c.key}>{c.label}</th>))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr key={String(r['id'] ?? idx)}>
                  {columns.map(c => (<td key={c.key}>{getValue(r, c.key) ?? ''}</td>))}
                  <td>
                    <button className="btn btn-sm btn-info me-2" onClick={() => navigate(`/testers/update/${r['id']}`)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => confirmDelete(String(r['id']))}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="d-flex justify-content-between align-items-center">
            <div>Showing {records.length} of {totalRecords}</div>
            <div>
              <button className="btn btn-sm btn-outline-secondary me-2" disabled={page<=1} onClick={() => void fetchData(page-1, search)}>Prev</button>
              <button className="btn btn-sm btn-outline-secondary" disabled={page>=totalPages} onClick={() => void fetchData(page+1, search)}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

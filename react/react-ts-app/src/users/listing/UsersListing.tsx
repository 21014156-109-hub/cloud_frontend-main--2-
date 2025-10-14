import { useEffect, useState, useCallback } from 'react';
import { UserService } from '../../users/user.service';
import { getClientID } from '../../utils/helper';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const userSvc = new UserService();

export default function UsersListing() {
  const clientId = getClientID();
  interface UserRecord {
    id?: string | number;
    srno?: number;
    fName?: string;
    lName?: string;
    userName?: string;
    email?: string;
    role?: { title?: string };
    organizationName?: string;
    status?: string;
  }

  const [records, setRecords] = useState<UserRecord[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate();

  const fetchData = useCallback(async (p: number) => {
    setPage(p);
    const res = await userSvc.getUsersListing(clientId, p - 1, pageSize);
    if (res.status) {
      const data = res.data as { totalItems?: number; totalPages?: number; data?: UserRecord[] } | undefined;
      setTotalRecords(data?.totalItems || 0);
      setTotalPages(data?.totalPages || 0);
      setRecords(data?.data || []);
    }
  }, [clientId, pageSize]);

  useEffect(() => { void fetchData(1); }, [fetchData]);

  function confirmDelete(id: string) {
    if (window.confirm('Are you sure you want to delete this client?')) {
      void deleteUser(id);
    }
  }

  async function deleteUser(id: string) {
    const rec = await userSvc.delete(id);
    if (rec.status) {
      toast.success((rec as { message?: string }).message || 'Deleted');
      void fetchData(1);
    }
  }

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between mb-3">
            <h3>Clients Management</h3>
            <div>
              <button className="btn btn-primary" onClick={() => navigate('/users/add')}>Add Client</button>
            </div>
          </div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Organization</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr key={String(r['id'] ?? idx)}>
                  <td>{r['srno'] ?? (idx + 1)}</td>
                  <td>{r['fName']}</td>
                  <td>{r['lName']}</td>
                  <td>{r['userName']}</td>
                  <td>{r['email']}</td>
                  <td>{r.role?.title}</td>
                  <td>{r['organizationName']}</td>
                  <td>{r['status']}</td>
                  <td>
                    <button className="btn btn-sm btn-info me-2" onClick={() => navigate(`/users/update/${r['id']}`)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => confirmDelete(String(r['id']))}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="d-flex justify-content-between align-items-center">
            <div>Showing {records.length} of {totalRecords}</div>
            <div>
              <button className="btn btn-sm btn-outline-secondary me-2" disabled={page<=1} onClick={() => void fetchData(page-1)}>Prev</button>
              <button className="btn btn-sm btn-outline-secondary" disabled={page>=totalPages} onClick={() => void fetchData(page+1)}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

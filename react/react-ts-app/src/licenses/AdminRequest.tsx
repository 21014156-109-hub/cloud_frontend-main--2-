import { useEffect, useState } from 'react';
import LicenseService from './license.service';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '../shared-components/breadcrumbs/Breadcrumbs';
import './licenses.css';

export default function AdminRequest() {
  type AdminRecord = { id?: string | number; srno?: number; client?: { fName?: string }; status?: string; createdAt?: string; reviewer?: { fName?: string } };
  const [records, setRecords] = useState<AdminRecord[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData(1);
  }, []);

  async function fetchData(page = 1) {
    const res = await LicenseService.getLicenseRequests(page - 1, 20);
    if (res?.status) setRecords(res.data?.data || []);
  }

  return (
    <div className="container-fluid mt-3">
      <Breadcrumbs />
      <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-body">
              <h3 className="mb-3">License Approval</h3>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>SrNo</th>
                      <th>Client Name</th>
                      <th>Status</th>
                      <th>Request Date</th>
                      <th>Reviewed By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, idx) => (
                      <tr key={r.id || idx}>
                        <td>{r.srno || idx + 1}</td>
                        <td>{r.client?.fName}</td>
                        <td>{r.status}</td>
                        <td>{r.createdAt}</td>
                        <td>{r.reviewer?.fName}</td>
                        <td>
                          <button className="btn btn-sm btn-link" onClick={() => navigate(`/licenses/view-request/${r.id}`)}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import LicenseService from './license.service';
import { useNavigate } from 'react-router-dom';

export default function RequestListing() {
  type ReqRecord = { id?: string | number; srno?: number; status?: string; createdAt?: string };
  const [records, setRecords] = useState<ReqRecord[]>([]);
  const [page] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData(page);
  }, [page]);

  async function fetchData(p = 1) {
    const res = await LicenseService.getLicenseRequests(p - 1, 20);
    if (res?.status) {
      const data = res.data;
      setRecords(data?.data || []);
    }
  }

  return (
    <div className="container-fluid mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>License Requests</h3>
        <button className="btn btn-primary" onClick={() => navigate('/licenses/add-request')}>Add Request</button>
      </div>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>SrNo</th>
              <th>Status</th>
              <th>Request Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, idx) => (
              <tr key={r.id || idx}>
                <td>{r.srno ?? idx + 1}</td>
                <td>{r.status}</td>
                <td>{r.createdAt}</td>
                <td>
                  <button className="btn btn-sm btn-link" onClick={() => navigate(`/licenses/view-request/${r.id}`)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

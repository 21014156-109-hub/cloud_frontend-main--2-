import { useEffect, useState } from 'react';
import LicenseService from './license.service';
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../components';
import './licenses.css';

export default function RequestListing() {
  type ReqRecord = { id?: string | number; srno?: number; status?: string; createdAt?: string };
  const [records, setRecords] = useState<ReqRecord[]>([]);
  const [page] = useState(1);
  const [openInfo, setOpenInfo] = useState<boolean>(false);
  const [openRequests, setOpenRequests] = useState<boolean>(true);
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
      <Breadcrumbs />

      <div className="row">
        <div className="col-xl-12">
          <div className="card mb-2">
            <div className="card-body d-flex justify-content-between align-items-center">
              <button className="btn btn-add-request" onClick={() => navigate('/licenses/add-request')}>
                <i className="fa fa-plus" style={{ marginRight: 8 }} /> Add Request
              </button>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="accordion-section">
                <button className={`accordion-toggle ${openInfo ? 'open' : ''}`} onClick={() => setOpenInfo(s => !s)}>
                  <span className="caret-left"><i className={`fa fa-chevron-${openInfo ? 'down' : 'right'}`} /></span>
                  <span className="accordion-title">License Info</span>
                </button>
                <div className={`accordion-content ${openInfo ? 'show' : ''}`}>
                  <div className="table-responsive">
                    <table className="table table-flush">
                      <thead className="thead-light">
                        <tr>
                          <th>Sr #</th>
                          <th>License</th>
                          <th>Remaining</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={3} className="text-center">No data to display</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <hr />

              <div className="accordion-section">
                <button className={`accordion-toggle ${openRequests ? 'open' : ''}`} onClick={() => setOpenRequests(s => !s)}>
                  <span className="caret-left"><i className={`fa fa-chevron-${openRequests ? 'down' : 'right'}`} /></span>
                  <span className="accordion-title">License Requests</span>
                </button>
                <div className={`accordion-content ${openRequests ? 'show' : ''}`}>
                  <div className="d-flex justify-content-end mb-2">
                    <input className="form-control search-box" placeholder="Search" style={{ width: 220 }} disabled />
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
                        {records.length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center">No data to display</td>
                          </tr>
                        )}
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
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

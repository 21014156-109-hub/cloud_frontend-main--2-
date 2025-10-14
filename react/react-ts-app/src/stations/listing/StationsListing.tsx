import { useCallback, useEffect, useState } from 'react';
import { StationsService } from '../../stations/stations.service';
import { getClientID } from '../../utils/helper';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const svc = new StationsService();

export default function StationsListing(){
  const clientId = getClientID();
  type StationRecord = { id?: string | number; srno?: number; stationName?: string; pcMacAddress?: string; operatingSystem?: string; warehouse?: { warehouseName?: string; id?: string | number }; status?: string };
  const [records, setRecords] = useState<StationRecord[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate();

  const fetchData = useCallback(async (p: number) => {
    setPage(p);
    const res = await svc.getCollectionInfoById(clientId, p - 1, pageSize);
    if (res.status) {
      const data = res.data as { totalItems?: number; totalPages?: number; data?: StationRecord[] } | undefined;
      setTotalRecords(data?.totalItems || 0);
      setTotalPages(data?.totalPages || 0);
      setRecords(data?.data || []);
    }
  }, [clientId, pageSize]);

  useEffect(() => { void fetchData(1); }, [fetchData]);

  function confirmDelete(id: string) {
    if (window.confirm('Are you sure you want to delete this station?')) {
      void deleteStation(id);
    }
  }

  async function deleteStation(id: string) {
    const res = await svc.deleteStation(id);
    if (res.status) {
      toast.success((res as { message?: string }).message || 'Deleted');
      void fetchData(1);
    }
  }

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between mb-3">
            <h3>Stations</h3>
            <div>
              <button className="btn btn-primary" onClick={() => navigate('/stations/add')}>Add Station</button>
            </div>
          </div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Station Name</th>
                <th>PC Mac</th>
                <th>OS</th>
                <th>Warehouse</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr key={String(r.id ?? idx)}>
                  <td>{r.srno ?? (idx+1)}</td>
                  <td>{r.stationName}</td>
                  <td>{r.pcMacAddress}</td>
                  <td>{r.operatingSystem}</td>
                  <td>{r.warehouse?.warehouseName}</td>
                  <td>{r.status}</td>
                  <td>
                    <button className="btn btn-sm btn-info me-2" onClick={() => navigate(`/stations/update/${r.id}`)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => confirmDelete(String(r.id))}>Delete</button>
                    <button className="btn btn-sm btn-secondary ms-2" onClick={() => navigate(`/stations/settings/${r.id}/${r.warehouse?.id}`)}>Settings</button>
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

import React, { useCallback, useEffect, useState } from 'react';
import { StationsService } from '../../stations/stations.service';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const svc = new StationsService();

type RecordItem = { srno?: number; id?: number; user?: { parent?: { userName?: string }, userName?: string, warehouse?: { warehouseName?: string } } };

export default function StationsAssignmentListing(){
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate();

  const fetchData = useCallback(async (p: number) => {
    setPage(p);
    const res = await svc.getStationsAssignmentListing(p - 1, pageSize);
    if (res.status) {
      const data = res.data as { totalItems?: number; totalPages?: number; data?: RecordItem[] } | undefined;
      setTotalRecords(data?.totalItems || 0);
      setTotalPages(data?.totalPages || 0);
      setRecords(data?.data || []);
    }
  }, [pageSize]);

  useEffect(() => { void fetchData(1); }, [fetchData]);

  function confirmDelete(testerId: number){
    if (window.confirm('Are you sure you want to delete this allocation?')) void deleteAllocations(testerId);
  }

  async function deleteAllocations(testerId: number){
    const res = await svc.deleteAllocation(testerId);
    if (res.status) { toast.success(res.message || 'Deleted'); void fetchData(1); }
  }

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between mb-3">
            <h3>Tester Assignments</h3>
            <div>
              <button className="btn btn-primary" onClick={() => navigate('/stations-assignment/add')}>Assign Stations</button>
            </div>
          </div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Client Name</th>
                <th>Tester Name</th>
                <th>Station Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr key={String(r.id ?? idx)}>
                  <td>{r.srno ?? (idx+1)}</td>
                  <td>{r.user?.parent?.userName}</td>
                  <td>{r.user?.userName}</td>
                  <td>{r.user?.warehouse?.warehouseName}</td>
                  <td>
                    <button className="btn btn-sm btn-info me-2" onClick={() => navigate(`/stations-assignment/update/${r.id}`)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => confirmDelete(Number(r.id))}>Delete</button>
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
  );
}

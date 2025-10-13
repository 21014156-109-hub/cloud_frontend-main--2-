import { useEffect, useState, useCallback } from 'react';
import { TestSuitesService } from '../../test-suites/testSuites.service';
import type { ApiResponse, TestSuiteSummary, PaginatedResponse } from '../../test-suites/testSuites.service';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const svc = new TestSuitesService();

export default function TestSuitesList() {
  const [records, setRecords] = useState<TestSuiteSummary[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // totalRecords available if needed later
  // const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = useCallback(async (p: number) => {
    try {
      const resp = await svc.getTestSuites(p - 1, pageSize) as ApiResponse<PaginatedResponse<TestSuiteSummary[]>>;
      if (resp.status) {
        const payload = resp.data;
  setRecords(payload.data ?? []);
        setTotalPages(payload.totalPages ?? 0);
      }
    } catch {
      toast.error('Failed to load test suites');
    }
  }, [pageSize]);

  useEffect(() => { void fetchData(page); }, [page, fetchData]);

  async function remove(id: number) {
    try {
      const res = await svc.deleteTestSuite(id) as ApiResponse<unknown>;
      if (res.status) { toast.success('Deleted'); await fetchData(1); }
      else toast.error(res.message || 'Failed to delete');
    } catch { toast.error('Failed to delete'); }
  }

  return (
    <div className="container-fluid pt-0">
      <div className="card-header">
        <div className="row">
          <div className="col-sm-6">
            <Link className="btn btn-dark-custom btn-padding" to="/test-suites/add-test-suite">+ Add Test Suite</Link>
          </div>
          <div className="col-sm-6 text-right">
            <input className="form-control" placeholder="Search" style={{ width: 200 }} />
          </div>
        </div>
      </div>
      <div className="card-body">
        <table className="table">
          <thead>
            <tr><th>Sr No.</th><th>Test Suite Name</th><th>Description</th><th>Tests Count</th><th>Created</th><th>Action</th></tr>
          </thead>
          <tbody>
            {records.length === 0 ? <tr><td colSpan={6}>No data to display</td></tr> : records.map((r, i) => (
              <tr key={r.id || i}>
                <td>{((page - 1) * pageSize) + i + 1}</td>
                <td>{r.testSuitName}</td>
                <td>{r.description}</td>
                <td>{Array.isArray(r.testPlan) ? r.testPlan.length : (Array.isArray(r.tests) ? r.tests.length : 0)}</td>
                <td>{r.createdAt ?? ''}</td>
                <td>
                  <Link className="text-black-50" to={`/test-suites/update-test-suite/${r.id}`}>Edit</Link>
                  <span> | </span>
                  <a className="text-danger" href="#" onClick={(e) => { e.preventDefault(); remove(r.id); }}>Delete</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <label className="mr-2">Page size</label>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); void fetchData(1); }}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div>
              <button className="btn btn-sm btn-light mr-2" disabled={page <= 1} onClick={() => { setPage((p) => p - 1); void fetchData(page - 1); }}>Prev</button>
              <span>Page {page} of {Math.max(totalPages, 1)}</span>
              <button className="btn btn-sm btn-light ml-2" disabled={page >= totalPages} onClick={() => { setPage((p) => p + 1); void fetchData(page + 1); }}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

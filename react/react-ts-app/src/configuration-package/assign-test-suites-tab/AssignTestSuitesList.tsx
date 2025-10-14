import { useCallback, useEffect, useState } from 'react';
import { TestSuitesAssignmentService } from '../../test-suites/testSuitesAssignment.service';
import type { ApiResponse } from '../../test-suites/testSuitesAssignment.service';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import AddTestSuitesAssignment from './AddTestSuitesAssignment';

type AssignmentSummary = {
  id: number;
  tester?: { userName?: string } | null;
  clientTestSuit?: { testSuitName?: string } | null;
};

const svc = new TestSuitesAssignmentService();

export default function AssignTestSuitesList() {
  const [records, setRecords] = useState<AssignmentSummary[]>([]);
  const [page] = useState(1);
  const [pageSize] = useState(10);
  const [showAdd, setShowAdd] = useState(false);

  const fetchData = useCallback(async (p: number) => {
    try {
      const resp = await svc.getTestSuiteAssignmentListing(p - 1, pageSize) as ApiResponse<Record<string, unknown>>;
      if (resp.status) {
        const payload = resp.data as Record<string, unknown> | undefined;
        const data = (payload?.data as AssignmentSummary[] | undefined) ?? [];
        setRecords(data);
      }
    } catch (err: unknown) {
      console.error('Failed to load assignments', err);
      // If auth has expired, http.ts already handled logout + toast + redirect
  if (err && typeof err === 'object' && (err as { code?: string }).code === 'AUTH_EXPIRED') return;
      toast.error('Failed to load assignments');
    }
  }, [pageSize]);

  useEffect(() => { void fetchData(page); }, [page, fetchData]);

  async function remove(id: number) {
    try {
      const res = await svc.deleteAssignment(id) as ApiResponse<Record<string, unknown>>;
  if (res.status) { toast.success('Deleted'); await fetchData(1); }
  else toast.error(res.message || 'Failed to delete');
    } catch (err: unknown) {
      console.error('Delete assignment failed', err);
  if (err && typeof err === 'object' && (err as { code?: string }).code === 'AUTH_EXPIRED') return;
      toast.error('Failed to delete');
    }
  }

  // When adding, show only the assignment form (hide list, search, and table)
  if (showAdd) {
    return (
      <div className="card-body">
        <AddTestSuitesAssignment onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); void fetchData(1); }} />
      </div>
    );
  }

  // Default: listing view with Add button and search
  return (
    <div>
      <div className="card-header">
        <div className="row">
          <div className="col-sm-6">
            <button className="btn btn-dark-custom btn-padding" onClick={() => setShowAdd(true)}>+ Add Test Suite</button>
          </div>
          <div className="col-sm-6 text-right">
            <input className="form-control" placeholder="Search" style={{ width: 200 }} />
          </div>
        </div>
      </div>
      <div className="card-body">
        <table className="table">
          <thead>
            <tr><th>Sr No.</th><th>Tester Name</th><th>Test Suite Name</th><th>Action</th></tr>
          </thead>
          <tbody>
            {records.length === 0 ? <tr><td colSpan={4}>No data to display</td></tr> : records.map((r, i) => (
              <tr key={r.id || i}>
                <td>{i + 1}</td>
                <td>{r.tester?.userName ?? ''}</td>
                <td>{r.clientTestSuit?.testSuitName ?? ''}</td>
                <td>
                  <Link className="text-black-50" to={`/test-suites-assignment/update/${r.id}`}>Edit</Link>
                  <span> | </span>
                  <a className="text-danger" href="#" onClick={(e) => { e.preventDefault(); remove(r.id); }}>Delete</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

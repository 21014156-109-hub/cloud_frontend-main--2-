import { useEffect, useState, useCallback } from 'react';
import { TestSuitesService } from '../../test-suites/testSuites.service';
import type { ApiResponse, TestSuiteSummary, PaginatedResponse } from '../../test-suites/testSuites.service';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import PaginationLinks from '../../shared-components/PaginationLinks';
import { getAuthUserData } from '../../utils/helper';

const svc = new TestSuitesService();

export default function TestSuitesList() {
  const [records, setRecords] = useState<TestSuiteSummary[]>([]);
  const [allRecords, setAllRecords] = useState<TestSuiteSummary[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // totalRecords available if needed later
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const isAdmin = (getAuthUserData()?.roleSlug === 'admin');

  const fetchData = useCallback(async (p: number) => {
    try {
      const resp = await svc.getTestSuites(p - 1, pageSize) as ApiResponse<PaginatedResponse<TestSuiteSummary[]>>;
      if (resp.status) {
        const payload = resp.data;
        const rows = (payload.data ?? []) as TestSuiteSummary[];
        setRecords(rows);
        setAllRecords(rows);
        setTotalPages(payload.totalPages ?? 0);
        setTotalRecords(payload.totalItems ?? rows.length);
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && (err as { code?: string }).code === 'AUTH_EXPIRED') return;
      toast.error('Failed to load test suites');
    }
  }, [pageSize]);

  useEffect(() => { void fetchData(page); }, [page, fetchData]);

  async function remove(id: number) {
    if (!isAdmin) { toast.error('Only administrators can delete test suites'); return; }
    if (!window.confirm('Are you sure? You want to delete!')) return;
    try {
      const res = await svc.deleteTestSuite(id) as ApiResponse<unknown>;
      if (res.status) { toast.success('Deleted'); await fetchData(1); }
      else toast.error(res.message || 'Failed to delete');
    } catch { toast.error('Failed to delete'); }
  }

  function testsCount(r: TestSuiteSummary): number {
    if (r.testPlan) {
      if (Array.isArray(r.testPlan)) return r.testPlan.length;
      if (typeof r.testPlan === 'string') {
        try { const parsed = JSON.parse(r.testPlan as unknown as string); return Array.isArray(parsed) ? parsed.length : 0; } catch { return 0; }
      }
    }
    return Array.isArray(r.tests) ? r.tests.length : 0;
  }

  function filterData(term: string) {
    setSearch(term);
    const cols: (keyof TestSuiteSummary)[] = ['testSuitName', 'description'];
    const filtered = allRecords.filter((row) => {
      const rec = row as unknown as Record<string, unknown>;
      return cols.some((c) => String(rec[c as string] || '').toLowerCase().includes(term.toLowerCase()));
    });
    setRecords(filtered);
  }

  return (
    <div className="container-fluid pt-0">
      <div className="card-header">
        <div className="row">
          <div className="col-sm-6">
            <Link className="btn btn-dark-custom btn-padding" to="/test-suites/add-test-suite">+ Add Test Suite</Link>
          </div>
          <div className="col-sm-6 text-right">
            <input className="form-control" placeholder="Search" style={{ width: 200 }} value={search} onChange={(e) => filterData(e.target.value)} />
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
                <td>{testsCount(r)}</td>
                <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</td>
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
          <PaginationLinks
            totalRecords={totalRecords}
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={(p) => { setPage(p); void fetchData(p); }}
            onPageSizeChange={(s) => { setPageSize(s); void fetchData(1); }}
          />
        )}
      </div>
    </div>
  );
}

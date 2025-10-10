import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClientTestSuitService } from '../clientTestSuit.service';
import type { ClientTestSuitItem } from '../clientTestSuit.service';
import PaginationLinks from '../../shared-components/PaginationLinks';
import { toast } from 'react-toastify';
import { getAuthUserData } from '../../utils/helper';
import '../../styles/client-test-suit.css';

export default function ClientTestSuitListing() {
  const service = useMemo(() => new ClientTestSuitService(), []);
  const isAdmin = (getAuthUserData()?.roleSlug === 'admin');
  const [records, setRecords] = useState<ClientTestSuitItem[]>([]);
  const [allRecords, setAllRecords] = useState<ClientTestSuitItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async (page: number) => {
    setCurrentPage(page);
    try {
      const response = await service.getClientTestSuitListing(page - 1, pageSize);
      if (response.status) {
        setTotalRecords(response.data.totalItems);
        setTotalPages(response.data.totalPages);
        setRecords(response.data.data);
        setAllRecords(response.data.data);
      }
    } catch {
      toast.error('Failed to load client test suites');
    }
  }, [pageSize, service]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  useEffect(() => {
    const w = window as Window & { __BREADCRUMB?: { name: string; link?: string }[] };
    w.__BREADCRUMB = [{ name: 'Dashboard', link: '/dashboard' }, { name: 'Client Test Suites', link: '' }];
    return () => { w.__BREADCRUMB = []; };
  }, []);

  function pageChange(page: number) { fetchData(page); }
  function changePage(newSize: number) { setPageSize(newSize); fetchData(1); }

  function filterData(term: string) {
    setSearch(term);
    const cols = ['client.userName', 'testSuit.testSuitName'];
    const filtered = allRecords.filter((row) => {
      const values = cols.map((c) => c.split('.').reduce((acc: unknown, key) => (acc as Record<string, unknown> | undefined)?.[key], row as unknown));
      return values.some((v) => String(v || '').toLowerCase().includes(term.toLowerCase()));
    });
    setRecords(filtered);
  }

  async function confirmDelete(id: number) {
    if (!isAdmin) return;
    if (window.confirm('Are you sure? You want to delete!')) {
      try {
        const res = await service.deleteClientTestSuit(id);
        if (res.status) {
          toast.success(res.message || 'Deleted successfully');
          fetchData(1);
        }
      } catch {
        toast.error('Delete failed');
      }
    }
  }

  return (
    <div className="container-fluid pt-0">
      <div className="row">
        <div className="col">
          <div className="card shadow">
            <div className="pr-lg-2">
              <div className="row search_row">
                {isAdmin && (
                  <div className="col-sm-6">
                    <a href="/client-test-suit/add" className="btn btn-padding btn-dark-custom btn-bold">
                      <i className="fa fa-plus" aria-hidden="true" /> Assign Test Suite
                    </a>
                  </div>
                )}
                <div className="offset-md-4 col-md-2 col-sm-12">
                  <input id="search-textbox" className="form-control search-textbox" type="text" placeholder="Search" style={{ height: 36 }} value={search} onChange={(e) => filterData(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Sr No.</th>
                    <th>Client Name</th>
                    <th>Test Suite Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((row, rowIndex) => (
                    <tr key={row.id}>
                      <td>{((currentPage - 1) * pageSize) + rowIndex + 1}</td>
                      <td>{row.client?.userName}</td>
                      <td>{row.testSuit?.testSuitName}</td>
                      <td>
                        <a className="text-black-50" href={`/client-test-suit/update/${row.id}`}>
                          <i className="fa fa-edit text-primary" aria-hidden="true" />
                        </a>
                        {isAdmin && (
                          <>
                            {' '}|{' '}
                            <a className="text-black-50" href="#" onClick={(e) => { e.preventDefault(); confirmDelete(row.id); }}>
                              <i className="fa fa-trash text-danger" aria-hidden="true" />
                            </a>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {records.length > 0 && (
              <PaginationLinks
                totalRecords={totalRecords}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={pageChange}
                onPageSizeChange={changePage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

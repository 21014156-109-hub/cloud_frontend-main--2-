
type Props = {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export default function PaginationLinks({ totalRecords, currentPage, totalPages, pageSize, onPageChange, onPageSizeChange }: Props) {
  return (
    <div className="card-footer py-4">
      <div className="row">
        <div className="col-sm-12 col-md-1">
          <select className="form-control pagination-dropdown" value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div className="col-sm-12 col-md-4">
          <div style={{ fontSize: '.875rem' }} id="datatable-basic_info" role="status" aria-live="polite">
            Total {totalRecords} entries
          </div>
        </div>
        <div className="col-sm-12 col-md-7">
          <div className="dataTables_paginate paging_simple_numbers">
            <nav aria-label="...">
              <ul className="pagination justify-content-end mb-0">
                <li className="page-item">
                  {currentPage > 1 && (
                    <a className="page-link" href="#" tabIndex={-1} onClick={(e) => { e.preventDefault(); onPageChange(Math.max(1, currentPage - 1)); }}>
                      <i className="fas fa-angle-left" />
                      <span className="sr-only">Previous</span>
                    </a>
                  )}
                </li>
                {Array.from({ length: Math.max(0, totalPages) }).map((_, i) => {
                  const page = i + 1;
                  // show a short window around current page like the Angular version
                  if (page < currentPage || page > currentPage + 3) return null;
                  return (
                    <li key={i} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                      <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); onPageChange(page); }}>{page}</a>
                    </li>
                  );
                })}
                <li className="page-item">
                  {totalPages > currentPage && (
                    <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); onPageChange(Math.min(totalPages || 1, currentPage + 1)); }}>
                      <i className="fas fa-angle-right" />
                      <span className="sr-only" />
                    </a>
                  )}
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

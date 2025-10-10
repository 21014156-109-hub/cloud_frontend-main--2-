
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
    <div className="p-3 d-flex justify-content-between align-items-center">
      <div>Total: {totalRecords}</div>
      <div>
        <button className="btn btn-secondary btn-sm mr-2" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Prev</button>
        <span className="mx-2">Page {currentPage} / {Math.max(1, totalPages)}</span>
        <button className="btn btn-secondary btn-sm" onClick={() => onPageChange(Math.min(totalPages || 1, currentPage + 1))} disabled={currentPage >= (totalPages || 1)}>Next</button>
      </div>
      <div>
        <select className="form-control" style={{ width: 80, display: 'inline-block' }} value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}

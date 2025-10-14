import React, { useEffect, useState } from 'react';
import { DeviceCatalogueService } from './deviceCatalogue.service';
import { useNavigate } from 'react-router-dom';
import PaginationLinks from '../shared-components/PaginationLinks';

const svc = new DeviceCatalogueService();

export default function DeviceCatalogueListing() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [searchType, setSearchType] = useState<'modelName' | 'modelNo'>('modelName');

  useEffect(() => { fetchData(1); }, []);

  async function fetchData(page: number) {
    setCurrentPage(page);
    try {
      const resp: any = await svc.listing(page - 1, pageSize, searchText, searchType);
      if (resp.status) {
        const p = resp.data;
        setRecords(p.data || []);
        setTotalRecords(p.totalItems || 0);
        setTotalPages(p.totalPages || 0);
      }
    } catch (e) { console.error(e); }
  }

  // selection handling like Angular: only allow selecting rows of same OS
  const [selectedRows, setSelectedRows] = useState<Array<{ id: number; os?: string }>>([]);

  function onCheckboxChange(e: React.ChangeEvent<HTMLInputElement>, row: any) {
    const already = selectedRows.findIndex((r) => r.id === row.id) !== -1;
    if (!selectedRows.length || (selectedRows.length && selectedRows[0].os === row.os)) {
      if (!already) setSelectedRows([...selectedRows, { id: row.id, os: row.os }]);
      else setSelectedRows(selectedRows.filter((r) => r.id !== row.id));
    } else {
      // ignore selection across different OS
      (e.target as HTMLInputElement).checked = false;
    }
  }

  function onEdit() {
    svc.setSelectedIdsArr(selectedRows);
    navigate('/device-catalogue/update');
  }

  function onView(id?: number) { if (id) navigate(`/device-catalogue/view/${id}`); }

  return (
    <div className="container-fluid pt-8">
      <div className="row">
        <div className="col">
          <div className="card shadow">
            <div className="row cust-row p-3">
              <div className="col-md-3"><input className="form-control" placeholder="Enter Model Name/No" value={searchText} onChange={(e) => setSearchText(e.target.value)} /></div>
              <div className="col-md-4">
                <label><input type="radio" checked={searchType === 'modelName'} onChange={() => setSearchType('modelName')} /> Search By Model Name</label>
                <label style={{ marginLeft: 8 }}><input type="radio" checked={searchType === 'modelNo'} onChange={() => setSearchType('modelNo')} /> Search By Model No</label>
              </div>
              <div className="col-md-2"><button className="btn btn-dark-custom" onClick={() => fetchData(1)}>Search</button></div>
            </div>

            <div className="p-3">
              <button className="btn btn-dark-custom mr-2" onClick={() => navigate('/device-catalogue/add')}>Add</button>
              <button className="btn btn-dark-custom" onClick={() => svc.exportReport({ type: 'xlsx' })}>Export</button>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr><th></th><th>Make</th><th>Model Name</th><th>Model No</th><th>OS</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={i}>
                      <td><input type="checkbox" onChange={(e) => onCheckboxChange(e, r)} /></td>
                      <td>{r.make}</td>
                      <td>{r.modelName}</td>
                      <td>{r.modelNo}</td>
                      <td>{r.os}</td>
                      <td><a href="#" onClick={(e) => { e.preventDefault(); onView(r.id); }}>View</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3">
              <button className="btn btn-dark-custom mr-2" disabled={!selectedRows.length} onClick={onEdit}>Edit Selected</button>
            </div>

            {totalRecords > 0 && <PaginationLinks totalRecords={totalRecords} currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} onPageChange={(p) => fetchData(p)} onPageSizeChange={(s) => { setPageSize(s); fetchData(1); }} />}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { WarehouseService } from '../../warehouses/warehouse.service';
import { getClientID } from '../../utils/helper';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const svc = new WarehouseService();

export default function WarehouseListing() {
  const clientId = getClientID();
  type WarehouseRecord = { id?: number; warehouseName?: string; warehouseClient?: { fName?: string }; timeZone?: string; status?: number };
  const [records, setRecords] = useState<WarehouseRecord[]>([]);
  const [page /*, setPage*/] = useState(1);
  const [pageSize /*, setPageSize*/] = useState(10);

  const fetchData = useCallback(async (p:number) => {
    try {
      const resp = await svc.getListing(clientId, p-1, pageSize);
      if (resp.status) {
        const data = resp.data || {};
        setRecords(data.data || []);
      }
    } catch {
      toast.error('Failed to load warehouses');
    }
  }, [clientId, pageSize]);

  useEffect(() => { fetchData(page); }, [page, fetchData]);

  async function confirmDelete(id?: number) {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this warehouse?')) return;
    try {
      const r = await svc.deleteWarehouse(String(id));
      if (r.status) { toast.success('Deleted'); fetchData(1); }
    } catch { toast.error('Delete failed'); }
  }

  return (
    <div className="container-fluid pt-8">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Warehouse</h3>
          <Link to="/warehouse/add" className="btn btn-dark-custom btn-padding">Add Warehouse</Link>
        </div>
        <div className="card-body">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Warehouse Name</th>
                <th>Client</th>
                <th>Timezone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r.id || i}>
                  <td>{i+1}</td>
                  <td>{r.warehouseName}</td>
                  <td>{r.warehouseClient?.fName}</td>
                  <td>{r.timeZone}</td>
                  <td>{r.status}</td>
                  <td>
                    <Link to={`/warehouse/update/${r.id}`} className="btn btn-sm btn-primary me-2">Edit</Link>
                    <button className="btn btn-sm btn-danger" onClick={() => confirmDelete(r.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

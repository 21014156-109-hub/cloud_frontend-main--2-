import { useEffect, useState, useCallback } from 'react';
import { WifiProfilesService } from '../wifiProfiles.service';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const svc = new WifiProfilesService();

export default function WifiProfilesListing() {
  type WifiRecord = { id?: number; warehouse?: { warehouseName?: string }; networkName?: string; password?: string };
  const [records, setRecords] = useState<WifiRecord[]>([]);
  const [page, /* setPage */] = useState(1);
  const [pageSize /* , setPageSize */] = useState(10);
  const [q, setQ] = useState('');
  // pagination totals (not shown in UI yet)

  useEffect(() => {
    const w = window as Window & { __BREADCRUMB?: { name: string; link?: string }[] };
    w.__BREADCRUMB = [{ name: 'Dashboard', link: '/dashboard' }, { name: 'Wifi Profiles', link: '' }];
    return () => { w.__BREADCRUMB = []; };
  }, []);

  const fetchData = useCallback(async (p: number) => {
    try {
      const resp = await svc.getWifiProfilesList(p - 1, pageSize);
      if (resp.status) {
        const data = resp.data as { data?: WifiRecord[] } | undefined;
        // normalize expected structure: { totalItems, totalPages, data }
        const recs = data?.data ?? [];
        setRecords(recs);
      }
    } catch {
      toast.error('Failed to load wifi profiles');
    }
  }, [pageSize]);

  useEffect(() => { fetchData(page); }, [page, fetchData]);

  // helper to extract .data array safely

  async function confirmDelete(id?: number) {
    // simple confirm
    if (!window.confirm('Are you sure you want to delete this wifi profile?')) return;
    if (!id) return;
    try {
      const check = await svc.checkWifiProfileAssigned(id);
      if (check.status && check.data == null) {
        const del = await svc.deleteWifiProfile(id);
        if (del.status) {
          toast.success(del.message || 'Deleted');
          fetchData(1);
        }
      } else {
        toast.error('Not Deleted: Wifi Profile is Assigned to Some Station');
      }
    } catch { toast.error('Delete failed'); }
  }

  const filtered = records.filter(r => {
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return (
      (r.warehouse?.warehouseName || '').toLowerCase().includes(needle) ||
      (r.networkName || '').toLowerCase().includes(needle) ||
      (r.password || '').toLowerCase().includes(needle)
    );
  });

  return (
    <div className="card shadow">
      <div className="card-header">
        <div className="row align-items-center">
          <div className="col-sm-6 d-flex align-items-center gap-2">
            <Link to="/wifi-profiles/add" className="btn btn-dark-custom btn-padding"><i className="fa fa-plus" /> Add Wifi Profile</Link>
          </div>
          <div className="col-sm-6 text-right">
            <input className="form-control" placeholder="Search" style={{ maxWidth: 220, marginLeft: 'auto' }} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <div className="mt-2">
          <span className="small" style={{ color: '#5e72e4' }}>Add Wi-Fi to enable automatic Wifi connection for the diagnostic test</span>
        </div>
      </div>
      <div className="card-body">
        <table className="table">
          <thead>
            <tr>
              <th>SRNO</th>
              <th>WAREHOUSE NAME</th>
              <th>NETWORK NAME</th>
              <th>PASSWORD</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5}>No data to display</td></tr>
            ) : filtered.map((r, i) => (
              <tr key={r.id || i}>
                <td>{i + 1}</td>
                <td>{r.warehouse?.warehouseName}</td>
                <td>{r.networkName}</td>
                <td>{r.password}</td>
                <td>
                  <Link to={`/wifi-profiles/update/${r.id}`} className="btn btn-sm btn-primary me-2">Edit</Link>
                  <button className="btn btn-sm btn-danger" onClick={() => confirmDelete(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

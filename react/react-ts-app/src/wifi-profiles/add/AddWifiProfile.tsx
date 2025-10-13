import { useEffect, useState } from 'react';
import { WifiProfilesService } from '../wifiProfiles.service';
import http from '../../services/http';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const svc = new WifiProfilesService();
const whSvc = { getCollectionInfo: () => http('warehouse') };

export default function AddWifiProfile() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<{ id: number; warehouseName: string }[]>([]);
  const [warehouseId, setWarehouseId] = useState<number | ''>('');
  const [networkName, setNetworkName] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const w = window as Window & { __BREADCRUMB?: { name: string; link?: string }[] };
    w.__BREADCRUMB = [{ name: 'Dashboard', link: '/dashboard' }, { name: 'Wifi Profiles', link: '/wifi-profiles/listing' }, { name: 'Add Wifi Profiles', link: '' }];
    return () => { w.__BREADCRUMB = []; };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const resp = await whSvc.getCollectionInfo();
        if (resp.status) setWarehouses(resp.data || []);
      } catch {
        // ignore
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!warehouseId || !networkName || !password) { toast.error('Please fill required fields'); return; }
    try {
      const resp = await svc.insert({ warehouseId: warehouseId as number, networkName, password });
      if (resp.status) {
        toast.success('Wifi Profile added successfully');
        navigate('/wifi-profiles/listing');
      } else toast.error(resp.message || 'Failed');
    } catch {
      toast.error('Failed to add wifi profile');
    }
  }

  return (
    <div className="container-fluid pt-3">
      <div className="card shadow">
        <div className="card-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="mb-0">Wifi Profiles - Add Wifi Profiles</h3>
            </div>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="row">
              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-control-label">Select Warehouse <span className="text-danger">*</span></label>
                  <select className={`form-control ${submitted && !warehouseId ? 'is-invalid' : ''}`} value={warehouseId} onChange={(e) => setWarehouseId(Number(e.target.value) || '')}>
                    <option value="">Select Warehouse</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouseName}</option>)}
                  </select>
                  {submitted && !warehouseId && <div className="text-danger mt-1">The warehouseId Field Is Required</div>}
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-control-label">Network Name <span className="text-danger">*</span></label>
                  <input className={`form-control ${submitted && !networkName ? 'is-invalid' : ''}`} value={networkName} onChange={(e) => setNetworkName(e.target.value)} />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-control-label">Password <span className="text-danger">*</span></label>
                  <input className={`form-control ${submitted && !password ? 'is-invalid' : ''}`} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="row mt-4">
              <div className="col text-right">
                <button className="btn" style={{ background: '#2ecc71', color: '#fff', padding: '8px 18px', borderRadius: 6 }} type="submit">Submit</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

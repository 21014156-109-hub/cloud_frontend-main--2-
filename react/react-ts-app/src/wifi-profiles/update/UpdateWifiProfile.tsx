import { useEffect, useState } from 'react';
import { WifiProfilesService } from '../wifiProfiles.service';
import http from '../../services/http';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const svc = new WifiProfilesService();

export default function UpdateWifiProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<{ id: number; warehouseName: string }[]>([]);
  const [warehouseId, setWarehouseId] = useState<number | ''>('');
  const [networkName, setNetworkName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const w = window as Window & { __BREADCRUMB?: { name: string; link?: string }[] };
    w.__BREADCRUMB = [{ name: 'Dashboard', link: '/dashboard' }, { name: 'Wifi Profiles', link: '/wifi-profiles/listing' }, { name: 'Update Wifi Profiles', link: '' }];
    return () => { w.__BREADCRUMB = []; };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const wh = await http('warehouse');
        if (wh.status) setWarehouses(wh.data || []);
        if (id) {
          const rec = await svc.getwifiProfile(Number(id));
          if (rec.status && rec.data) {
            setNetworkName(rec.data.networkName || '');
            setPassword(rec.data.password || '');
            setWarehouseId(rec.data.warehouseId || '');
          }
        }
      } catch {
        // ignore
      }
    })();
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!warehouseId || !networkName || !password) { toast.error('Please fill required fields'); return; }
    try {
      const resp = await svc.update({ id: Number(id), warehouseId: warehouseId as number, networkName, password });
      if (resp.status) {
        toast.success('Wifi Profile updated successfully');
        navigate('/wifi-profiles/listing');
      } else toast.error(resp.message || 'Failed');
    } catch {
      toast.error('Failed to update wifi profile');
    }
  }

  return (
    <div>
      <h3>Update Wifi Profile</h3>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label>Warehouse</label>
          <select className="form-control" value={warehouseId} onChange={(e) => setWarehouseId(Number(e.target.value) || '')}>
            <option value="">Select warehouse</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouseName}</option>)}
          </select>
        </div>
        <div className="mb-3">
          <label>Network Name</label>
          <input className="form-control" value={networkName} onChange={(e) => setNetworkName(e.target.value)} />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-dark-custom">Submit</button>
      </form>
    </div>
  );
}

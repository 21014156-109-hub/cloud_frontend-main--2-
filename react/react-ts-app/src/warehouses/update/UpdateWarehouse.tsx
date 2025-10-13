import { useEffect, useState } from 'react';
import { WarehouseService } from '../../warehouses/warehouse.service';
import { UserService } from '../../users/user.service';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const svc = new WarehouseService();
const userSvc = new UserService();

export default function UpdateWarehouse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clients, setClients] = useState<{ id:number; text:string }[]>([]);
  const [warehouseName, setWarehouseName] = useState('');
  const [clientId, setClientId] = useState<number | ''>('');
  const [timeZone, setTimeZone] = useState<string | ''>('');
  const [timezones, setTimezones] = useState<{ id:string; text:string }[]>([]);

  useEffect(() => { void fetchClients(); void fetchTimezones(); if (id) void loadRecord(id); }, [id]);

  async function fetchClients(term = '') {
    try {
      const r = await userSvc.getRecords(0, 'client', '1', term);
      if (r.status) {
        type UserRecord = { id: number; fName?: string; lName?: string; userName?: string };
        const list = (r.data || []) as UserRecord[];
        setClients(list.map((rec) => ({ id: rec.id, text: `${rec.fName ?? ''} ${rec.lName ?? ''} (${rec.userName ?? ''})` })));
      }
    } catch (err) { console.debug(err); }
  }

  async function fetchTimezones() {
    try {
      const r = await svc.getTimezoneList();
      if (r.status) setTimezones(Object.entries(r.data || {}).map(([k,v]) => ({ id: k, text: String(v) })));
    } catch (err) { console.debug(err); }
  }

  async function loadRecord(idParam: string) {
    try {
      const r = await svc.getWarehouseInfoById(idParam);
      if (r.status && r.data) {
        type Rec = { warehouseName?: string; clientId?: number; timeZone?: string };
        const rec = r.data as Rec;
        setWarehouseName(rec.warehouseName || '');
        setClientId(rec.clientId ?? '');
        setTimeZone(rec.timeZone || '');
      }
    } catch (err) { console.debug(err); }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    try {
      const payload = { id, warehouseName: warehouseName.trim(), clientId: clientId || undefined, timeZone, status: 1 };
      const r = await svc.updateWarehouse(payload);
      if (r.status) { toast.success('Warehouse updated'); navigate('/warehouse/listing'); }
    } catch { toast.error('Update failed'); }
  }

  return (
    <div className="container-fluid pt-3">
      <div className="card shadow">
        <div className="card-body">
          <h3>Update Warehouse</h3>
          <form onSubmit={onSubmit}>
            <div className="row">
              <div className="col-md-4">
                <label>Warehouse Name</label>
                <input className="form-control" value={warehouseName} onChange={(e) => setWarehouseName(e.target.value)} />
              </div>
              <div className="col-md-4">
                <label>Client</label>
                <select className="form-control" value={clientId} onChange={(e) => setClientId(Number(e.target.value) || '')}>
                  <option value="">Select</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.text}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label>Timezone</label>
                <select className="form-control" value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
                  <option value="">Select</option>
                  {timezones.map(t => <option key={t.id} value={t.id}>{t.text}</option>)}
                </select>
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

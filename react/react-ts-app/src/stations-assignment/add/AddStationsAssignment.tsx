import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { UserService } from '../../users/user.service';
import { StationsService } from '../../stations/stations.service';
import { getAuthUserData } from '../../utils/helper';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const userSvc = new UserService();
const stationSvc = new StationsService();

type Option = { id: number; text: string };
type Station = { id: number; stationName?: string };

export default function AddStationsAssignment(){
  const [clients, setClients] = useState<Option[]>([]);
  const [testers, setTesters] = useState<Option[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [clientId, setClientId] = useState<number | undefined>(undefined);
  const [testerId, setTesterId] = useState<number | undefined>(undefined);
  const [stationIds, setStationIds] = useState<number[]>([]);
  const ud = getAuthUserData();
  const isAdmin = ud?.roleSlug === 'admin';
  const navigate = useNavigate();

  type AuthUser = { id?: number; roleSlug?: string; clientId?: number } | null | undefined;
  const initClientId = useMemo(() => {
    const u = ud as AuthUser;
    if (!u) return undefined;
    if (u.roleSlug === 'client') return u.id as number;
    return u.clientId as number | undefined;
  }, [ud]);

  const loadClients = useCallback(async (search = '') => {
    const res = await userSvc.getRecords(0, 'client', '1', search);
    if (res.status) {
      const list = res.data || [] as Array<{ id: number; fName?: string; lName?: string; userName?: string }>;
      setClients(list.map(c => ({ id: c.id, text: `${c.fName ?? ''} ${c.lName ?? ''} (${c.userName ?? ''})` })));
    }
  }, []);

  const loadTesters = useCallback(async (cid?: number) => {
    if (!cid) return;
    const res = await userSvc.getRecords(cid, 'tester');
    if (res.status) {
      const list = res.data || [] as Array<{ id: number; fName?: string; lName?: string; userName?: string; warehouseId?: number }>;
      setTesters(list.map(t => ({ id: t.id, text: `${t.fName ?? ''} ${t.lName ?? ''} (${t.userName ?? ''})` })));
    }
  }, []);

  const loadStationsForTester = useCallback(async (tid?: number) => {
    if (!tid || !clientId) return;
    // find tester warehouseId from testers list? API expects warehouseId; Angular looks it up from user record
    const rec = (await userSvc.getRecord(String(tid)));
    if (rec.status) {
      const whId = rec.data?.warehouseId as number;
      const body = { clientId, warehouseId: whId };
      const res = await stationSvc.getStationsByClientWarehouse(body);
      if (res.status) setStations(res.data || []);
      setStationIds([]);
    }
  }, [clientId]);

  useEffect(() => {
    if (isAdmin) void loadClients(); else setClientId(initClientId);
  }, [isAdmin, initClientId, loadClients]);

  useEffect(() => { if (clientId) void loadTesters(clientId); }, [clientId, loadTesters]);
  useEffect(() => { if (testerId) void loadStationsForTester(testerId); }, [testerId, loadStationsForTester]);

  async function onSubmit(e: React.FormEvent){
    e.preventDefault();
    if (!testerId) { toast.error('Please select a tester'); return; }
    if (!stationIds.length) { toast.error('Please select stations'); return; }
    const payload = { testerId, stationIds };
    const res = await stationSvc.assignStations(payload) as { status: boolean; message?: string };
    if (res.status) { toast.success(res.message || 'Assigned'); navigate('/stations-assignment/listing'); }
    else { toast.error(res.message || 'Error'); }
  }

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body">
          <h3>Assign Stations</h3>
          <form onSubmit={onSubmit}>
            <div className="row">
              {isAdmin && (
                <div className="col-lg-4">
                  <label className="form-label">Client</label>
                  <select className="form-control mb-2" value={clientId ?? ''} onChange={(e) => setClientId(Number(e.target.value) || undefined)}>
                    <option value="">Select Client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.text}</option>)}
                  </select>
                </div>
              )}
              <div className="col-lg-4">
                <label className="form-label">Tester</label>
                <select className="form-control mb-2" value={testerId ?? ''} onChange={(e) => setTesterId(Number(e.target.value) || undefined)}>
                  <option value="">Select Tester</option>
                  {testers.map(t => <option key={t.id} value={t.id}>{t.text}</option>)}
                </select>

                <label className="form-label">Stations</label>
                <div className="border rounded p-2" style={{ maxHeight: 260, overflowY: 'auto' }}>
                  {stations.map(s => (
                    <div key={s.id} className="form-check">
                      <input className="form-check-input" id={`s-${s.id}`} type="checkbox" checked={stationIds.includes(s.id)} onChange={(e) => {
                        const checked = e.target.checked; setStationIds(prev => {
                          const st = new Set(prev); if (checked) st.add(s.id); else st.delete(s.id); return Array.from(st);
                        });
                      }} />
                      <label className="form-check-label" htmlFor={`s-${s.id}`}>{s.stationName}</label>
                    </div>
                  ))}
                  {stations.length === 0 && <div className="text-muted">No stations</div>}
                </div>
              </div>
            </div>
            <div className="mt-3"><button className="btn btn-primary" type="submit">Assign</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}

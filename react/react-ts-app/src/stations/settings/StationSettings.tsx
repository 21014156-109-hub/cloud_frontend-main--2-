import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StationsService } from '../../stations/stations.service';
import { toast } from 'react-toastify';

const svc = new StationsService();

type WifiProfile = { id: number; networkName: string };

export default function StationSettings(){
  const { sid, wid } = useParams();
  const stationId = Number(sid);
  const warehouseId = Number(wid);
  const [available, setAvailable] = useState<WifiProfile[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [desktopWorkflow, setDesktopWorkflow] = useState<string>('');
  const [eraseOnly, setEraseOnly] = useState<string>('');
  const navigate = useNavigate();

  const loadAvailable = useCallback(async () => {
    if (!warehouseId) return;
    const res = await svc.getwifiprofilesbyWarehouse(warehouseId);
    if (res.status) setAvailable((res.data || []) as WifiProfile[]);
  }, [warehouseId]);

  const loadAssigned = useCallback(async () => {
    if (!stationId) return;
    const res = await svc.getWifiProfileAllocations(stationId);
    if (res.status) {
      const arr = (res.data || []) as Array<{ wifiProfileId: number; wifiProfile?: { networkName?: string } }>;
      setSelected(arr.map(a => Number(a.wifiProfileId)));
    }
  }, [stationId]);

  const loadStationMeta = useCallback(async () => {
    if (!stationId) return;
    const res = await svc.getStationInfoById(stationId);
    if (res.status) {
      const r = res.data as { desktopWorkflow?: string; eraseOnly?: string };
      setDesktopWorkflow(r?.desktopWorkflow || '');
      setEraseOnly(r?.eraseOnly || '');
    }
  }, [stationId]);

  useEffect(() => { void loadAvailable(); void loadAssigned(); void loadStationMeta(); }, [loadAvailable, loadAssigned, loadStationMeta]);

  function toggle(id: number, checked: boolean){
    setSelected(prev => {
      const s = new Set(prev);
      if (checked) s.add(id); else s.delete(id);
      return Array.from(s);
    });
  }

  async function onSubmit(e: React.FormEvent){
    e.preventDefault();
    const body = { wifiProfileIds: selected, desktopWorkflow, stationId, eraseOnly };
    const res = await svc.saveStationWifiProfile(body) as { status: boolean; message?: string };
    if (res.status) { toast.success(res.message || 'Saved'); navigate('/stations/listing'); }
    else { toast.error(res.message || 'Error'); }
  }

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body">
          <h3>Station Settings</h3>
          <form onSubmit={onSubmit}>
            <div className="row">
              <div className="col-lg-5">
                <label className="form-label">Wifi Profiles</label>
                <div className="border rounded p-2" style={{ maxHeight: 260, overflowY: 'auto' }}>
                  {available.map(p => (
                    <div key={p.id} className="form-check">
                      <input className="form-check-input" id={`p-${p.id}`} type="checkbox" checked={selected.includes(p.id)} onChange={e => toggle(p.id, e.target.checked)} />
                      <label className="form-check-label" htmlFor={`p-${p.id}`}>{p.networkName}</label>
                    </div>
                  ))}
                  {available.length === 0 && <div className="text-muted">No profiles</div>}
                </div>
              </div>
              <div className="col-lg-5">
                <label className="form-label">Desktop Workflow</label>
                <input className="form-control mb-2" value={desktopWorkflow} onChange={e => setDesktopWorkflow(e.target.value)} />
                <label className="form-label">Erase Only</label>
                <input className="form-control" value={eraseOnly} onChange={e => setEraseOnly(e.target.value)} />
              </div>
            </div>
            <div className="mt-3">
              <button className="btn btn-primary" type="submit">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

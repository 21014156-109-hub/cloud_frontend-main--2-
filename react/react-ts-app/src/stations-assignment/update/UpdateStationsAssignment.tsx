import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StationsService } from '../../stations/stations.service';
import { UserService } from '../../users/user.service';
import { toast } from 'react-toastify';

const stationSvc = new StationsService();
const userSvc = new UserService();

type Station = { id: number; stationName?: string };

export default function UpdateStationsAssignment(){
  const { id } = useParams(); // testerId
  const testerId = Number(id);
  const [testerName, setTesterName] = useState<string>('');
  const [stations, setStations] = useState<Station[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const navigate = useNavigate();

  const loadTesterAndStations = useCallback(async () => {
    if (!testerId) return;
    const rec = await userSvc.getRecord(String(testerId));
    if (rec.status) {
      setTesterName(`${rec.data?.fName ?? ''} ${rec.data?.lName ?? ''} (${rec.data?.userName ?? ''})`);
      const body = { clientId: rec.data?.parent?.id, warehouseId: rec.data?.warehouseId };
      const st = await stationSvc.getStationsByClientWarehouse(body);
      if (st.status) setStations(st.data || []);
    }
  }, [testerId]);

  const loadAssigned = useCallback(async () => {
    if (!testerId) return;
    const res = await stationSvc.getAllocationData(testerId);
    if (res.status) {
      const arr = (res.data || []) as Array<{ stationId: number }>;
      setSelected(arr.map(a => Number(a.stationId)));
    }
  }, [testerId]);

  useEffect(() => { void loadTesterAndStations(); void loadAssigned(); }, [loadTesterAndStations, loadAssigned]);

  async function onSubmit(e: React.FormEvent){
    e.preventDefault();
    if (!selected.length) { toast.error('Please select stations'); return; }
    const payload = { testerId, stationIds: selected };
    const res = await stationSvc.assignStations(payload) as { status: boolean; message?: string };
    if (res.status) { toast.success(res.message || 'Saved'); navigate('/stations-assignment/listing'); }
    else { toast.error(res.message || 'Error'); }
  }

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body">
          <h3>Update Assigned Stations</h3>
          <div className="mb-2"><strong>Tester:</strong> {testerName}</div>
          <form onSubmit={onSubmit}>
            <div className="border rounded p-2" style={{ maxHeight: 300, overflowY: 'auto' }}>
              {stations.map(s => (
                <div key={s.id} className="form-check">
                  <input className="form-check-input" id={`s-${s.id}`} type="checkbox" checked={selected.includes(s.id)} onChange={(e) => {
                    const checked = e.target.checked; setSelected(prev => { const st = new Set(prev); if (checked) st.add(s.id); else st.delete(s.id); return Array.from(st); });
                  }} />
                  <label className="form-check-label" htmlFor={`s-${s.id}`}>{s.stationName}</label>
                </div>
              ))}
              {stations.length === 0 && <div className="text-muted">No stations</div>}
            </div>
            <div className="mt-3"><button className="btn btn-primary" type="submit">Save</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}

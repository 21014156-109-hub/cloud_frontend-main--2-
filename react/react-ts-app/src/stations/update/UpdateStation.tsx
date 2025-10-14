import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StationsService } from '../../stations/stations.service';
import { toast } from 'react-toastify';

const svc = new StationsService();

type FormState = {
  stationName: string;
  pcMacAddress?: string;
  operatingSystem: string;
  status: number | string;
};

export default function UpdateStation(){
  const { id } = useParams();
  const [form, setForm] = useState<FormState>({ stationName: '', pcMacAddress: '', operatingSystem: '', status: 1 });
  const [clientId, setClientId] = useState<number | string | undefined>(undefined);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    if (!id) return;
    const res = await svc.getStationInfoById(id);
    if (res.status) {
      const r = res.data as { clientId?: number | string; stationName?: string; pcMacAddress?: string; operatingSystem?: string; status?: number };
      setClientId(r?.clientId);
      setForm({ stationName: r?.stationName || '', pcMacAddress: r?.pcMacAddress || '', operatingSystem: r?.operatingSystem || '', status: r?.status ?? 1 });
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;
    setForm(prev => ({ ...prev, [name]: value } as FormState));
  }

  async function onSubmit(e: React.FormEvent){
    e.preventDefault();
    const body = { id, stationName: form.stationName.trim(), pcMacAddress: form.pcMacAddress?.trim(), operatingSystem: form.operatingSystem, status: form.status, clientId };
    const res = await svc.updateStation(body) as { status: boolean; message?: string };
    if (res.status) { toast.success('Station Updated'); navigate('/stations/listing'); } else { toast.error(res.message || 'Error'); }
  }

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body">
          <h3>Update Station</h3>
          <form onSubmit={onSubmit}>
            <div className="row">
              <div className="col-lg-4">
                <input name="stationName" className="form-control mb-2" placeholder="Station Name" value={form.stationName} onChange={onChange} />
                <input name="pcMacAddress" className="form-control mb-2" placeholder="PC Mac" value={form.pcMacAddress} onChange={onChange} />
                <input name="operatingSystem" className="form-control mb-2" placeholder="Operating System" value={form.operatingSystem} onChange={onChange} />
                <select name="status" className="form-control mb-2" value={form.status} onChange={onChange}>
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
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

import React, { useCallback, useEffect, useState } from 'react';
import { StationsService } from '../../stations/stations.service';
import { UserService } from '../../users/user.service';
import { WarehouseService } from '../../warehouses/warehouse.service';
import { getAuthUserData } from '../../utils/helper';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const svc = new StationsService();
const userSvc = new UserService();
const warehouseSvc = new WarehouseService();

export default function AddStation(){
  const [clients, setClients] = useState<{ id:number; text: string }[]>([]);
  type Warehouse = { id?: string | number; warehouseName?: string };
  type WifiProfile = { id: number; networkName: string };
  type FormState = {
    stationName: string;
    pcMacAddress: string;
    operatingSystem: string;
    warehouseId: string | number;
    networkName: string;
    password: string;
    wifiProfiles: number[];
    clientId?: string | number;
  };
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [availableWifiProfiles, setAvailableWifiProfiles] = useState<WifiProfile[]>([]);
  const [form, setForm] = useState<FormState>({ stationName: '', pcMacAddress: '', operatingSystem: '', warehouseId: '', networkName: '', password: '', wifiProfiles: [] });
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const ud = getAuthUserData();
    setIsAdmin(ud?.roleSlug === 'admin');
    if (ud?.roleSlug === 'admin') void fetchClients();
    else if (ud?.id) void fetchWarehouses(ud.id);
    // fetchClients is stable (defined with useCallback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClients = useCallback(async (search = '') => {
    const res = await userSvc.getRecords(0, 'client', '1', search);
    if (res.status) {
      const list = res.data || [] as Array<Record<string, unknown>>;
      setClients(list.map((c) => ({ id: Number(c.id as number), text: `${c.fName as string} ${c.lName as string} (${c.userName as string})` })));
    }
  }, []);

  async function fetchWarehouses(clientId: string | number) {
    const res = await warehouseSvc.getCollectionInfoById(String(clientId), '1');
    setWarehouses(res.status ? res.data : []);
  }

  async function getWifiProfiles(warehouseId: string | number) {
    const res = await svc.getwifiprofilesbyWarehouse(Number(warehouseId));
    if (res.status) setAvailableWifiProfiles((res.data || []) as WifiProfile[]);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;
    setForm(prev => ({ ...prev, [name]: value } as FormState));
    if (name === 'warehouseId') void getWifiProfiles(value);
    if (name === 'clientId') void fetchWarehouses(value);
  }

  function onWifiToggle(id: number, checked: boolean) {
    setForm(prev => {
      const set = new Set(prev.wifiProfiles || []);
      if (checked) set.add(id); else set.delete(id);
      return { ...prev, wifiProfiles: Array.from(set) } as FormState;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Basic required validations similar to Angular
    if (!form.stationName.trim()) { toast.error('Station Name is required'); return; }
    if (!form.operatingSystem.trim()) { toast.error('Operating System is required'); return; }
    if (!form.warehouseId) { toast.error('Select Warehouse'); return; }
    if (isAdmin && !form.clientId) { toast.error('Select Client'); return; }

    const payload = {
      stationName: form.stationName.trim(),
      pcMacAddress: form.pcMacAddress.trim(),
      operatingSystem: form.operatingSystem,
      warehouseId: Number(form.warehouseId),
      status: 1,
      clientId: isAdmin ? Number(form.clientId) : getAuthUserData()?.id,
      networkName: form.networkName.trim(),
      password: form.password.trim(),
      wifiProfiles: (form.wifiProfiles || []).map(Number)
    };
    try {
      const res = await svc.saveStation(payload) as { status: boolean; message?: string };
      if (res.status) {
        toast.success('Station Added');
        navigate('/stations/listing');
      } else {
        toast.error(res.message || 'Error');
      }
    } catch (err: unknown) {
      const e = err as { message?: string; error?: { message?: string } } | undefined;
      toast.error(e?.message || e?.error?.message || 'Request failed');
    }
  }

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body">
          <h3>Add Station</h3>
          <form onSubmit={onSubmit}>
            <div className="row">
              {isAdmin && (
                <div className="col-lg-4">
                  <select name="clientId" className="form-control mb-2" onChange={onChange}>
                    <option value="">Select Client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.text}</option>)}
                  </select>
                </div>
              )}
              <div className="col-lg-4">
                <input name="stationName" className="form-control mb-2" placeholder="Station Name" value={form.stationName} onChange={onChange} />
                <input name="pcMacAddress" className="form-control mb-2" placeholder="PC Mac" value={form.pcMacAddress} onChange={onChange} />
                <input name="operatingSystem" className="form-control mb-2" placeholder="Operating System" value={form.operatingSystem} onChange={onChange} />
                <select name="warehouseId" className="form-control mb-2" value={form.warehouseId} onChange={onChange}>
                  <option value="">Select Warehouse</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouseName}</option>)}
                </select>
                <input name="networkName" className="form-control mb-2" placeholder="Network Name" value={form.networkName} onChange={onChange} />
                <input type="password" name="password" className="form-control mb-2" placeholder="Password" value={form.password} onChange={onChange} />
                {availableWifiProfiles.length > 0 && (
                  <div className="mb-2">
                    <label>Available Wifi Profiles</label>
                    <div>
                      {availableWifiProfiles.map(p => (
                        <div className="form-check" key={p.id}>
                          <input className="form-check-input" type="checkbox" id={`wifi-${p.id}`} checked={form.wifiProfiles.includes(p.id)} onChange={(e) => onWifiToggle(p.id, e.target.checked)} />
                          <label className="form-check-label" htmlFor={`wifi-${p.id}`}>{p.networkName}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3">
              <button className="btn btn-primary" type="submit">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
